import React from 'react';
import { AlertCircle, CheckCircle, Loader2, WifiOff } from 'lucide-react';
import { useAblyConnection } from '@/hooks/use-ably-connection';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AblyConnectionIndicatorProps {
  className?: string;
}

export const AblyConnectionIndicator: React.FC<AblyConnectionIndicatorProps> = ({
  className = '',
}) => {
  const { 
    isConnected, 
    isConnecting, 
    isFailed, 
    error, 
    reconnect 
  } = useAblyConnection();

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (isFailed) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'Real-time messaging connected';
    }
    if (isConnecting) {
      return 'Connecting to real-time messaging...';
    }
    if (isFailed) {
      return `Connection failed: ${error || 'Unknown error'}`;
    }
    return 'Real-time messaging disconnected';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`size-8 p-0 ${className}`}
            onClick={!isConnected && !isConnecting ? reconnect : undefined}
          >
            {getStatusIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
          {(isFailed || (!isConnected && !isConnecting)) && (
            <p className="text-xs text-muted-foreground">Click to reconnect</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};