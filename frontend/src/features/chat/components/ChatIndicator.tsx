import { Badge } from '@/components/ui/badge';
import { useUnreadMessages } from '@/hooks/use-unread-messages';

interface ChatIndicatorProps {
  className?: string;
}

export const ChatIndicator = ({ className = '' }: ChatIndicatorProps) => {
  const { totalUnreadCount } = useUnreadMessages();
  
  if (totalUnreadCount === 0) {
    return null;
  }
  
  return (
    <Badge 
      variant="destructive" 
      className={`h-5 w-5 flex items-center justify-center p-0 text-xs ${className}`}
    >
      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
    </Badge>
  );
};