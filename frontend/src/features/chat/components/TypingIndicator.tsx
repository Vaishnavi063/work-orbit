import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  isTyping: boolean;
  typingUser: string | null;
  className?: string;
}

export const TypingIndicator = ({ 
  isTyping, 
  typingUser, 
  className 
}: TypingIndicatorProps) => {
  if (!isTyping) return null;
  
  return (
    <div className={cn(
      "text-xs text-muted-foreground px-4 py-1",
      className
    )}>
      <div className="flex items-center gap-1">
        <span>{typingUser || 'Someone'} is typing</span>
        <span className="flex">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </div>
    </div>
  );
}; 