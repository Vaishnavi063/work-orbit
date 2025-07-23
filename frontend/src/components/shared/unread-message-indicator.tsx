import { useUnreadMessages } from '@/hooks/use-unread-messages';
import { Badge } from '@/components/ui/badge';

interface UnreadMessageIndicatorProps {
  className?: string;
}

export const UnreadMessageIndicator = ({ className = '' }: UnreadMessageIndicatorProps) => {
  const { totalUnreadCount } = useUnreadMessages();
  
  if (totalUnreadCount === 0) {
    return null;
  }
  
  return (
    <Badge 
      variant="destructive" 
      className={`flex items-center justify-center p-0 text-xs ${className}`}
    >
      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
    </Badge>
  );
};

export default UnreadMessageIndicator;