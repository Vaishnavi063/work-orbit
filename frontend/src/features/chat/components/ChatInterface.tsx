import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from '@/hooks/use-chat';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatInterfaceProps {
  chatRoomId: number;
  chatType: 'BID_NEGOTIATION' | 'CONTRACT';
  referenceId: number;
  className?: string;
}

export const ChatInterface = ({ chatRoomId, chatType, referenceId, className }: ChatInterfaceProps) => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    markAsRead, 
    hasMore, 
    loadMore 
  } = useChat({ chatRoomId, chatType, referenceId });
  
  const { 
    isTyping, 
    typingUser, 
    startTyping 
  } = useTypingIndicator({ chatRoomId, chatType, referenceId });
  
  // Mark messages as read when chat is opened
  useEffect(() => {
    markAsRead();
  }, [chatRoomId, markAsRead]);
  
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
  
  return (
    <Card className={`h-full flex flex-col ${className || ''}`}>
      <CardContent className="p-0 flex flex-col h-full">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 text-center">
            {error}
          </div>
        )}
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          hasMore={hasMore} 
          onLoadMore={loadMore} 
        />
        
        <TypingIndicator 
          isTyping={isTyping} 
          typingUser={typingUser} 
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          onTyping={startTyping} 
          disabled={isLoading} 
        />
      </CardContent>
    </Card>
  );
}; 