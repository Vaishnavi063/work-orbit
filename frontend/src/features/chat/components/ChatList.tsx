import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import { MessageSquare, Search, Calendar, RefreshCw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  fetchUserChatRooms,
  fetchActiveChatRooms,
  selectChatRooms,
  selectChatLoading,
  selectChatError,
} from "@/store/slices/chat-slice";
import type { AppDispatch, RootState } from "@/store";
import type { ChatRoom } from "@/types";

// BidDetails interface matching backend response
interface BidDetails {
  bidId: number;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  status: string;
  createdAt: string;
  canAccept: boolean;
  canReject: boolean;
}

// Extended ChatRoom type with bid details for UI display
interface ExtendedChatRoom extends ChatRoom {
  bidDetails?: BidDetails;
}

export const ChatList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const chatRooms = useSelector(selectChatRooms);
  const loading = useSelector(selectChatLoading);
  const error = useSelector(selectChatError);
  const { authToken } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Fetch chat rooms based on active tab
  const fetchChatRooms = useCallback(() => {
    if (!authToken) return;

    if (activeTab === "all") {
      dispatch(fetchUserChatRooms({ authToken }));
    } else {
      dispatch(fetchActiveChatRooms({ authToken }));
    }
  }, [authToken, dispatch, activeTab]);

  // Use ref to keep track of the interval ID
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch and set up polling
  useEffect(() => {
    if (!authToken) return;

    // Initial fetch
    fetchChatRooms();

    // Set up polling interval with adaptive frequency
    // Poll more frequently when the tab is visible, less when hidden
    const pollingInterval = document.hidden ? 30000 : 10000; // 10s when visible, 30s when hidden

    intervalIdRef.current = setInterval(fetchChatRooms, pollingInterval);

    // Update polling frequency when visibility changes
    const handleVisibilityChange = () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      const newPollingInterval = document.hidden ? 30000 : 10000;
      intervalIdRef.current = setInterval(fetchChatRooms, newPollingInterval);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authToken, fetchChatRooms]);

  const handleChatRoomClick = (chatRoomId: number) => {
    navigate(`/dashboard/chats/${chatRoomId}`);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // If it's today, show time
      if (date.toDateString() === now.toDateString()) {
        return format(date, "h:mm a");
      }

      // If it's within the last week, show day of week
      if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return format(date, "EEE");
      }

      // Otherwise show date
      return format(date, "MMM d");
    } catch {
      return "recently";
    }
  };

  const formatLastActive = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  // Filter chat rooms based on search query
  const filteredChatRooms: ExtendedChatRoom[] = chatRooms
    .filter((room) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        room.otherParty.name.toLowerCase().includes(query) ||
        (room.lastMessage &&
          room.lastMessage.content.toLowerCase().includes(query))
      );
    })
    .map((room) => room as ExtendedChatRoom);

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="p-4 border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="active"
        className="flex-1 flex flex-col"
        onValueChange={setActiveTab}
      >
        <div className="px-4 pt-2 flex-shrink-0">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Active
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All Chats
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="active"
          className="flex-1 mt-0 min-h-0 overflow-hidden"
        >
          <ChatRoomsList
            chatRooms={filteredChatRooms.filter(
              (room) => room.status === "ACTIVE"
            )}
            isLoading={loading.chatRooms}
            error={error.chatRooms}
            onChatRoomClick={handleChatRoomClick}
            formatTime={formatTime}
            formatLastActive={formatLastActive}
          />
        </TabsContent>

        <TabsContent value="all" className="flex-1 mt-0 min-h-0">
          <ChatRoomsList
            chatRooms={filteredChatRooms}
            isLoading={loading.chatRooms}
            error={error.chatRooms}
            onChatRoomClick={handleChatRoomClick}
            formatTime={formatTime}
            formatLastActive={formatLastActive}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ChatRoomsListProps {
  chatRooms: ExtendedChatRoom[];
  isLoading: boolean;
  error: string | null;
  onChatRoomClick: (chatRoomId: number) => void;
  formatTime: (dateString: string) => string;
  formatLastActive: (dateString: string) => string;
}

const ChatRoomsList = ({
  chatRooms,
  isLoading,
  error,
  onChatRoomClick,
  formatTime,
  formatLastActive,
}: ChatRoomsListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useSelector((state: RootState) => state.auth);

  if (isLoading && chatRooms.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-destructive mb-4">
          <span className="text-lg">Failed to load chats</span>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            toast.info("Retrying...", {
              description: "Attempting to reconnect to chat service",
            });

            // Retry fetching chat rooms
            if (authToken) {
              dispatch(fetchUserChatRooms({ authToken }));
            }
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-muted-foreground max-w-xs">
          When you start chatting with clients or freelancers, your
          conversations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden">
      <div className="p-4 space-y-3">
        {chatRooms.map((room) => {
          // Extract project title from bid details if available
          const projectTitle = room.bidDetails?.projectTitle || "Chat";

          return (
            <Card
              key={room.id}
              className={`overflow-hidden cursor-pointer transition-colors hover:bg-muted/50 ${
                room.unreadCount > 0 ? "border-primary/50 bg-primary/5" : ""
              }`}
              onClick={() => onChatRoomClick(room.id)}
            >
              <CardContent className="p-0">
                <div className="p-4 flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium">
                      {room.otherParty?.name
                        ? room.otherParty.name.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">
                        {room.otherParty?.name || "Unknown User"}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium truncate text-muted-foreground/80">
                        {projectTitle}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {room.lastMessage
                          ? room.lastMessage.content
                          : "No messages yet"}
                      </p>
                      {room.unreadCount > 0 && (
                        <Badge className="ml-2 flex-shrink-0">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge
                        variant={
                          room.status === "ACTIVE" ? "default" : "outline"
                        }
                        className="font-normal"
                      >
                        {room.chatType === "BID_NEGOTIATION"
                          ? "Bid"
                          : "Contract"}
                      </Badge>

                      {room.bidDetails?.bidAmount && (
                        <Badge variant="outline" className="font-normal">
                          {room.bidDetails.bidAmount.toLocaleString()}
                        </Badge>
                      )}

                      <span className="flex items-center ml-auto">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatLastActive(room.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
