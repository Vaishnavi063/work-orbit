import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from '@/hooks/use-chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  chatRoomId: number;
  className?: string;
}

export const ChatInterface = ({ chatRoomId, className }: ChatInterfaceProps) => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    markAsRead, 
    hasMore, 
    loadMore 
  } = useChat({ chatRoomId });
  
  
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
    <Card className={className}>
      <CardContent className="p-0 h-[600px] flex flex-col">
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
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading} 
        />
      </CardContent>
    </Card>
  );
}; 