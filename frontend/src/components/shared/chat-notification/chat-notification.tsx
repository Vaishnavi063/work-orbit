import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  fetchActiveChatRooms, 
  selectChatRooms, 
  selectTotalUnreadCount,
  selectChatLoading
} from '@/store/slices/chat-slice';
import type { RootState, AppDispatch } from '@/store';
import { cn } from '@/lib/utils';

export const ChatNotification = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const chatRooms = useSelector(selectChatRooms);
  const totalUnreadCount = useSelector(selectTotalUnreadCount);
  const loading = useSelector(selectChatLoading);
  const { authToken } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (authToken && open) {
      dispatch(fetchActiveChatRooms({ authToken }));
    }
  }, [authToken, open, dispatch]);
  
  const handleChatRoomClick = (chatRoomId: number) => {
    setOpen(false);
    navigate(`/dashboard/chats/${chatRoomId}`);
  };
  
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // If the message is from today, show only the time
      if (date.toDateString() === now.toDateString()) {
        return format(date, 'h:mm a');
      }
      
      // If the message is from this week, show the day name
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        return format(date, 'EEE');
      }
      
      // Otherwise show the date
      return format(date, 'MMM d');
    } catch (e) {
      return '';
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="h-5 w-5" />
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
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Messages</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => navigate('/dashboard/chats')}
          >
            <span className="sr-only">View all messages</span>
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading.chatRooms ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
              <p>No messages yet</p>
              <p className="text-sm">Your messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {chatRooms.map((room) => (
                <div 
                  key={room.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted transition-colors",
                    room.unreadCount > 0 && "bg-muted/50"
                  )}
                  onClick={() => handleChatRoomClick(room.id)}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {room.otherParty.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {room.unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {room.otherParty.name}
                      </p>
                      {room.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate",
                      room.unreadCount > 0 ? "font-medium" : "text-muted-foreground"
                    )}>
                      {room.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => navigate('/dashboard/chats')}
          >
            View All Messages
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};