import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { chatApis } from '../apis';
import type { RootState } from '@/store';

interface ContractChatButtonProps {
  contractId: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const ContractChatButton = ({
  contractId,
  variant = 'outline',
  size = 'sm',
  className = '',
  showLabel = true
}: ContractChatButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken } = useSelector((state: RootState) => state.auth);
  const { handleError } = useErrorHandler();
  
  const handleClick = async () => {
    if (!authToken) {
      handleError('Authentication required', {
        toastTitle: 'Authentication Error',
        showToast: true
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create or get chat room for this contract
      const response = await chatApis.getContractChatRoom(contractId, authToken);
      const chatRoomId = response.data.data.id;
      
      // Navigate to the chat room
      navigate(`/dashboard/chats/${chatRoomId}`);
    } catch (err: any) {
      handleError(err?.response?.data?.error?.message || 'Failed to open chat', {
        toastTitle: 'Chat Error',
        showToast: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className={`h-4 w-4 ${showLabel ? 'mr-2' : ''}`} />
      )}
      {showLabel && 'Chat'}
    </Button>
  );
};