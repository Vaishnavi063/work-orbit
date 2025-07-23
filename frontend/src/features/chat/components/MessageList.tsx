import { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, RefreshCcw, AlertCircle, Check } from 'lucide-react';
import type { ChatMessage } from '@/types';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Enhanced message interface with status
interface EnhancedChatMessage extends ChatMessage {
  status: 'pending' | 'delivered' | 'error';
  clientId?: string;
}

interface MessageListProps {
  messages: EnhancedChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: (clientId: string) => void;
}

// Group messages by date for better organization
const groupMessagesByDate = (messages: EnhancedChatMessage[]) => {
  const groups: { [key: string]: EnhancedChatMessage[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const dateKey = date.toLocaleDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(message);
  });
  
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages: messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }));
};

export const MessageList = ({ messages, isLoading, hasMore, onLoadMore, onRetry }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth?.user);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);
  
  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, autoScroll]);
  
  // Detect user scrolling up to disable auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // If user scrolls up more than 100px, disable auto-scroll
      const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 100;
      if (isScrolledUp && autoScroll) {
        setAutoScroll(false);
      }
      
      // If user scrolls to bottom, enable auto-scroll again
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
      if (isAtBottom && !autoScroll) {
        setAutoScroll(true);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [autoScroll]);
  
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
  
  // Format date for date separators
  const formatDate = (dateString: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString();
    
    if (dateString === today) {
      return 'Today';
    } else if (dateString === yesterdayString) {
      return 'Yesterday';
    } else {
      return new Date(dateString).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };
  
  // Handle retry for a failed message
  const handleRetry = (clientId: string) => {
    if (onRetry) {
      onRetry(clientId);
    }
  };
  
  // Render message status indicator with tooltips
  const renderStatusIndicator = (message: EnhancedChatMessage) => {
    switch (message.status) {
      case 'pending':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center">
                  <Clock className="inline h-3 w-3 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Sending message...
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'delivered':
        return message.isRead ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center">
                  <Check className="inline h-3 w-3 text-success" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Read
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center">
                  <CheckCircle2 className="inline h-3 w-3 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Delivered
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 text-destructive" 
                  onClick={() => message.clientId && handleRetry(message.clientId)}
                >
                  <RefreshCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Failed to send. Click to retry.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };
  
  // Render system message based on message type
  const renderSystemMessage = (message: EnhancedChatMessage) => {
    switch (message.messageType) {
      case 'SYSTEM_NOTIFICATION':
        return (
          <div className="bg-muted text-muted-foreground text-xs rounded-md py-1 px-3">
            {message.content}
          </div>
        );
      case 'BID_ACTION':
        return (
          <div className="bg-primary/10 text-primary text-xs rounded-md py-1 px-3 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {message.content}
          </div>
        );
      case 'MILESTONE_UPDATE':
        return (
          <div className="bg-success/10 text-success text-xs rounded-md py-1 px-3 flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {message.content}
          </div>
        );
      default:
        return (
          <div className="bg-muted text-muted-foreground text-xs rounded-md py-1 px-3">
            {message.content}
          </div>
        );
    }
  };
  
  return (
    <div 
      ref={messagesContainerRef}
      className="flex flex-col gap-3 overflow-y-auto p-4 flex-grow"
    >
      {isLoading && (
        <div className="flex justify-center my-2">
          <div className="bg-muted text-muted-foreground text-xs rounded-md py-1 px-3">
            Loading messages...
          </div>
        </div>
      )}
      
      {messageGroups.map(({ date, messages: groupMessages }) => (
        <div key={date} className="flex flex-col gap-3">
          <div className="flex justify-center my-2">
            <div className="bg-muted/50 text-muted-foreground text-xs rounded-md py-1 px-3">
              {formatDate(date)}
            </div>
          </div>
          
          {groupMessages.map((message) => {
            const isCurrentUser = user?.id === message.senderId;
            const isSystemMessage = message.messageType !== 'TEXT';
            
            if (isSystemMessage) {
              return (
                <div 
                  key={message.id} 
                  className="flex justify-center my-2"
                >
                  {renderSystemMessage(message)}
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
                  {/* Sender name for non-current user */}
                  {!isCurrentUser && (
                    <span className="text-xs text-muted-foreground mb-1">
                      {message.senderName}
                    </span>
                  )}
                  
                  <div className={cn(
                    "rounded-lg p-3",
                    isCurrentUser 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-secondary text-secondary-foreground rounded-tl-none",
                    message.status === 'error' && isCurrentUser && "bg-destructive/10",
                    message.status === 'pending' && isCurrentUser && "bg-primary/80"
                  )}>
                    {message.content}
                  </div>
                  
                  <div className={cn(
                    "text-xs text-muted-foreground mt-1 flex items-center gap-1",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isCurrentUser && (
                      <span className="ml-1">
                        {renderStatusIndicator(message)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
}; 