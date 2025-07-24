import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  chatRoomId: number;
  chatType: "BID_NEGOTIATION" | "CONTRACT";
  referenceId: number;
  className?: string;
  disabled?: boolean;
  onMilestoneAction?: (action: string) => void;
}

export const ChatInterface = ({ 
  chatRoomId, 
  chatType, 
  referenceId,
  className, 
  disabled = false,
  onMilestoneAction
}: ChatInterfaceProps) => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    markAsRead, 
    hasMore, 
    loadMore,
    retryMessage
  } = useChatMessages({ chatRoomId, chatType, referenceId });
  
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  
  // Mark messages as read when chat is opened
  useEffect(() => {
    markAsRead();
  }, [chatRoomId, markAsRead]);
  
  // Handle message sending with status tracking
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setSendingState('sending');
    
    try {
      await sendMessage(content);
      setSendingState('idle');
      
      // Check for milestone commands in contract chat
      if (chatType === 'CONTRACT' && onMilestoneAction) {
        const lowerContent = content.toLowerCase();
        
        // Simple command parsing for milestone actions
        if (lowerContent.startsWith('/milestone')) {
          const parts = content.split(' ');
          if (parts.length > 1) {
            const action = parts[1].toLowerCase();
            if (['create', 'list', 'update', 'complete'].includes(action)) {
              onMilestoneAction(action);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setSendingState('error');
    }
  }, [sendMessage, chatType, onMilestoneAction]);
  
  // Handle retry for all failed messages
  const handleRetryAll = useCallback(() => {
    const failedMessages = messages.filter(msg => msg.status === 'error');
    
    if (failedMessages.length === 0) return;
    
    // Increment retry count to trigger useEffect
    setRetryCount(prev => prev + 1);
    
    // Reset error state
    setSendingState('idle');
  }, [messages]);
  
  // Effect to retry failed messages when retryCount changes
  useEffect(() => {
    if (retryCount === 0) return;
    
    const failedMessages = messages.filter(msg => msg.status === 'error');
    
    if (failedMessages.length === 0) return;
    
    // Retry each failed message
    failedMessages.forEach(msg => {
      if (msg.clientId) {
        retryMessage(msg.clientId);
      }
    });
  }, [retryCount, messages, retryMessage]);
  
  return (
    <Card className={`h-full flex flex-col ${className || ''}`}>
      <CardContent className="p-0 flex flex-col h-full min-h-0">
        {error && (
          <Alert variant="destructive" className="mb-2 mx-2 mt-2 flex-shrink-0">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryAll}
                className="ml-2"
              >
                <RefreshCcw className="mr-1 h-3 w-3" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          hasMore={hasMore} 
          onLoadMore={loadMore}
          onRetry={retryMessage}
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || disabled} 
          sendingState={sendingState}
        />
      </CardContent>
    </Card>
  );
}; 