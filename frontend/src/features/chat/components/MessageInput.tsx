import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onRetry?: () => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  sendingState: 'idle' | 'sending' | 'error';
  errorMessage?: string;
}

export const MessageInput = ({ 
  onSendMessage, 
  onRetry,
  disabled = false,
  placeholder = 'Type a message...',
  sendingState = 'idle',
  errorMessage
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);
  
  // Reset submitting state when sendingState changes
  useEffect(() => {
    if (sendingState !== 'sending') {
      setIsSubmitting(false);
    }
  }, [sendingState]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isSubmitting || sendingState === 'sending') return;
    
    setIsSubmitting(true);
    
    try {
      await onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      // Error handling is managed by the parent component through sendingState
      console.error('Failed to send message:', error);
    }
  };
  
  const handleRetry = async () => {
    if (onRetry && sendingState === 'error') {
      try {
        await onRetry();
      } catch (error) {
        console.error('Failed to retry sending message:', error);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  // Determine button state
  const isSending = isSubmitting || sendingState === 'sending';
  const isError = sendingState === 'error';
  const isButtonDisabled = !message.trim() || disabled || isSending;
  
  return (
    <div className="flex flex-col p-4 border-t bg-background flex-shrink-0">
      {isError && errorMessage && (
        <div className="flex items-center gap-2 text-destructive text-sm mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs" 
              onClick={handleRetry}
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
          aria-label="Message input"
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="submit" 
                size="icon" 
                disabled={isButtonDisabled}
                variant={isError ? "destructive" : "default"}
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isSending ? 'Sending...' : isError ? 'Retry sending' : 'Send message'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </div>
  );
}; 