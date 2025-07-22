import React from 'react';
import { AlertCircle, CheckCircle, Loader2, WifiOff } from 'lucide-react';
import { useAblyConnection } from '@/hooks/use-ably-connection';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AblyConnectionStatusProps {
  showWhenConnected?: boolean;
  className?: string;
}

/**
 * Component to display Ably connection status and provide reconnection controls
 */
export const AblyConnectionStatus: React.FC<AblyConnectionStatusProps> = ({
  showWhenConnected = false,
  className = '',
}) => {
  const { 
    isConnected, 
    isConnecting, 
    isFailed, 
    error, 
    reconnect 
  } = useAblyConnection();

  // Don't show anything if connected and showWhenConnected is false
  if (isConnected && !showWhenConnected) {
    return null;
  }

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

  const getAlertVariant = () => {
    if (isConnected) return 'default';
    if (isFailed) return 'destructive';
    return 'default';
  };

  return (
    <Alert variant={getAlertVariant()} className={className}>
      {getStatusIcon()}
      <AlertDescription className="flex items-center justify-between">
        <span>{getStatusText()}</span>
        {(isFailed || (!isConnected && !isConnecting)) && (
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            className="ml-2"
          >
            Reconnect
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};