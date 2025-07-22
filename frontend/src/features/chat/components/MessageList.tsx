import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import type { RootState } from '@/store';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const MessageList = ({ messages, isLoading, hasMore, onLoadMore }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // Handle infinite scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (
        container.scrollTop < 100 && 
        !isLoading && 
        hasMore
      ) {
        // Save current scroll position and height
        const scrollHeight = container.scrollHeight;
        
        onLoadMore();
        
        // Restore scroll position after new messages load
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - scrollHeight;
          }
        }, 100);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, onLoadMore]);
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div 
      ref={messagesContainerRef}
      className="flex flex-col-reverse gap-3 overflow-y-auto p-4 flex-grow"
    >
      <div ref={messagesEndRef} />
      
      {messages.map((message) => {
        const isCurrentUser = user?.id === message.senderId;
        const isSystemMessage = message.messageType !== 'TEXT';
        
        if (isSystemMessage) {
          return (
            <div 
              key={message.id} 
              className="flex justify-center my-2"
            >
              <div className="bg-muted text-muted-foreground text-xs rounded-md py-1 px-3">
                {message.content}
              </div>
            </div>
          );
        }
        
        return (
          <div 
            key={message.id}
            className={cn(
              "flex gap-2 max-w-[80%]",
              isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {message.senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <div className={cn(
                "rounded-lg p-3",
                isCurrentUser 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-secondary text-secondary-foreground rounded-tl-none"
              )}>
                {message.content}
              </div>
              
              <div className={cn(
                "text-xs text-muted-foreground mt-1",
                isCurrentUser ? "text-right" : "text-left"
              )}>
                {formatTime(message.createdAt)}
                {isCurrentUser && (
                  <span className="ml-1">
                    {message.isRead ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {isLoading && (
        <div className="flex justify-center my-2">
          <div className="bg-muted text-muted-foreground text-xs rounded-md py-1 px-3">
            Loading messages...
          </div>
        </div>
      )}
    </div>
  );
}; 