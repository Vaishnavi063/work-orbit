import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserChatRooms, selectChatRooms, selectTotalUnreadCount, selectChatLoading } from '@/store/slices/chat-slice';
import { formatDistanceToNow } from 'date-fns';
import type { AppDispatch, RootState } from '@/store';


export const ChatNotification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const chatRooms = useSelector(selectChatRooms);
  const totalUnreadCount = useSelector(selectTotalUnreadCount);
  const loading = useSelector(selectChatLoading);
  const { authToken } = useSelector((state: RootState) => state.auth);
  const [open, setOpen] = useState(false);
  
  // Poll for chat updates when the popover is open
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (open && authToken) {
      // Initial fetch
      dispatch(fetchUserChatRooms({ authToken }));
      
      // Set up polling
      pollingInterval = setInterval(() => {
        dispatch(fetchUserChatRooms({ authToken }));
      }, 10000); // Poll every 10 seconds when open
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [open, authToken, dispatch]);
  
  // Background polling for notifications (less frequent)
  useEffect(() => {
    let backgroundInterval: NodeJS.Timeout | null = null;
    
    if (authToken) {
      backgroundInterval = setInterval(() => {
        dispatch(fetchUserChatRooms({ authToken }));
      }, 30000); // Poll every 30 seconds in the background
    }
    
    return () => {
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
      }
    };
  }, [authToken, dispatch]);
  
  const handleChatRoomClick = (chatRoomId: number) => {
    navigate(`/dashboard/chats/${chatRoomId}`);
    setOpen(false);
  };
  
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Messages</h3>
        </div>
        
        <ScrollArea className="h-80">
          {loading.chatRooms ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {chatRooms.map((room) => (
                <div 
                  key={room.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    room.unreadCount > 0 ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => handleChatRoomClick(room.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">
                      {room.otherParty.name}
                    </span>
                    {room.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(room.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                    </p>
                    {room.unreadCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {room.chatType === 'BID_NEGOTIATION' ? 'Bid' : 'Contract'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              navigate('/dashboard/chats');
              setOpen(false);
            }}
          >
            View All Messages
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};