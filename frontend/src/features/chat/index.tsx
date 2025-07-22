import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { chatApis } from "./apis";
import { ChatInterface } from "./components";
import { BidNegotiationChat } from "./components/BidNegotiationChat";
import { ContractChat } from "./components/ContractChat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RootState } from "@/store";
import type { ChatRoom } from "@/types";

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const authToken = useSelector((state: RootState) => state.auth?.authToken);

    // Extract chatRoomId from the path manually since we're using /*
    const pathParts = location.pathname.split("/");
    // Check if the path has more segments after 'chats'
    const chatRoomId =
        pathParts.length > 3 && pathParts[3] !== "" ? pathParts[3] : undefined;
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load chat rooms only once when component mounts
    useEffect(() => {
        if (!authToken) return;

        const loadChatRooms = async () => {
            try {
                setIsLoading(true);
                const response = await chatApis.getUserChatRooms(authToken);
                setChatRooms(response.data.data);

                // If no chatRoomId is provided, navigate to the first chat room
                if (!chatRoomId && response.data.data.length > 0) {
                    navigate(`/dashboard/chats/${response.data.data[0].id}`);
                }
            } catch (err: any) {
                console.error("Error loading chat rooms:", err);
                setError(
                    err?.response?.data?.error?.message ||
                        "Failed to load chat rooms"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadChatRooms();
        // Only depend on authToken and navigate, not chatRoomId
    }, [authToken, navigate]);

    // Get the current chat room
    const currentChatRoom = chatRoomId
        ? chatRooms.find((room) => room.id === parseInt(chatRoomId, 10))
        : null;

    // Handle chat room selection changes
    useEffect(() => {
        // Mark messages as read when chat room changes
        if (chatRoomId && authToken) {
            const chatRoomIdNum = parseInt(chatRoomId, 10);
            chatApis
                .markAsRead({ chatRoomId: chatRoomIdNum, authToken })
                .catch((err) =>
                    console.error("Failed to mark messages as read:", err)
                );
        }
    }, [chatRoomId, authToken]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[600px] text-destructive">
                {error}
            </div>
        );
    }

    if (chatRooms.length === 0) {
        return (
            <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                No chat rooms available.
            </div>
        );
    }

    // Determine which chat component to render based on chat type
    const renderChatComponent = () => {
        if (!chatRoomId) {
            return (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    Select a conversation to start chatting.
                </div>
            );
        }

        const chatRoomIdNum = parseInt(chatRoomId, 10);

        // Check if the chat room exists
        if (!currentChatRoom) {
            return (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    Chat room not found. Please select a valid conversation.
                </div>
            );
        }

        switch (currentChatRoom.chatType) {
            case "BID_NEGOTIATION":
                return <BidNegotiationChat chatRoomId={chatRoomIdNum} />;
            case "CONTRACT":
                return <ContractChat chatRoomId={chatRoomIdNum} />;
            default:
                return <ChatInterface chatRoomId={chatRoomIdNum} />;
        }
    };

    return (
        <div className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chat rooms sidebar */}
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y">
                        {chatRooms.map((room) => (
                            <li key={room.id}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(
                                            `/dashboard/chats/${room.id}`,
                                            { replace: true }
                                        );
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between ${
                                        chatRoomId &&
                                        parseInt(chatRoomId, 10) === room.id
                                            ? "bg-accent"
                                            : ""
                                    }`}
                                >
                                    <div>
                                        <div className="font-medium">
                                            {room.otherParty.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {room.lastMessage?.content ||
                                                "No messages yet"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {room.chatType === "BID_NEGOTIATION"
                                                ? "Bid Discussion"
                                                : room.chatType === "CONTRACT"
                                                ? "Contract"
                                                : "Chat"}
                                        </div>
                                    </div>

                                    {room.unreadCount > 0 && (
                                        <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                            {room.unreadCount}
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Chat interface */}
            <div className="md:col-span-2">{renderChatComponent()}</div>
        </div>
    );
}
