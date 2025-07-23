import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, CalendarIcon, DollarSignIcon, CheckCircleIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { ChatInterface } from './ChatInterface';
import { MilestonePanel } from './MilestonePanel';
import { chatApis } from '../apis';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface ContractDetailsResponse {
  contractId: number;
  projectId: number;
  projectTitle: string;
  bidId: number;
  clientId: number;
  clientName: string;
  freelancerId: number;
  freelancerName: string;
  contractAmount: number;
  durationDays: number;
  contractStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneNotification {
  id: number;
  title: string;
  status: string;
  action: string;
}

interface ContractChatProps {
  chatRoomId: number;
  className?: string;
}

export const ContractChat = ({ chatRoomId, className }: ContractChatProps) => {
  const [contractDetails, setContractDetails] = useState<ContractDetailsResponse | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [overdueMilestones, setOverdueMilestones] = useState<number>(0);
  const [milestoneNotification, setMilestoneNotification] = useState<MilestoneNotification | null>(null);
  
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Fetch contract details and milestone information
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        const response = await chatApis.getContractDetailsForChat(chatRoomId, authToken);
        setContractDetails(response.data.data);
        
        // Fetch completion percentage if contract details are available
        if (response.data.data?.contractId) {
          try {
            // Get milestone completion percentage
            const completionResponse = await chatApis.getMilestoneCompletionForChat(chatRoomId, authToken);
            if (completionResponse.data.status === 'success') {
              setCompletionPercentage(completionResponse.data.data);
            }
            
            // Get overdue milestones count
            const overdueResponse = await chatApis.getOverdueMilestonesForChat(chatRoomId, authToken);
            if (overdueResponse.data.status === 'success') {
              setOverdueMilestones(overdueResponse.data.data.length);
            }
          } catch (err) {
            console.error('Failed to fetch milestone information:', err);
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to load contract details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContractDetails();
  }, [chatRoomId, authToken]);
  
  // Handle milestone notifications
  const handleMilestoneNotification = useCallback(async (notification: MilestoneNotification) => {
    if (!authToken || !chatRoomId) return;
    
    try {
      setMilestoneNotification(notification);
      
      // Format notification message based on action type
      let notificationMessage = '';
      switch (notification.action) {
        case 'created':
          notificationMessage = `New milestone created: "${notification.title}"`;
          break;
        case 'updated':
          notificationMessage = `Milestone "${notification.title}" was updated`;
          break;
        case 'status_change':
          notificationMessage = `Milestone "${notification.title}" status changed to ${notification.status}`;
          break;
        case 'deleted':
          notificationMessage = `Milestone "${notification.title}" was deleted`;
          break;
        default:
          notificationMessage = `Milestone update: "${notification.title}"`;
      }
      
      // Send notification to chat
      await chatApis.sendMilestoneNotification(chatRoomId, notificationMessage, authToken);
      
      // Clear notification after sending
      setTimeout(() => {
        setMilestoneNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to send milestone notification:', err);
      setError('Failed to send milestone notification to chat');
    }
  }, [chatRoomId, authToken]);
  
  // Handle milestone status update
  const handleMilestoneStatusUpdate = useCallback(async (milestoneId: number, title: string, status: string) => {
    if (!authToken || !chatRoomId) return;
    
    try {
      // Update milestone status
      await chatApis.updateMilestoneStatusFromChat(chatRoomId, milestoneId, status, authToken);
      
      // Send notification to chat
      await handleMilestoneNotification({
        id: milestoneId,
        title,
        status,
        action: 'status_change'
      });
      
      // Refresh completion percentage
      const completionResponse = await chatApis.getMilestoneCompletionForChat(chatRoomId, authToken);
      if (completionResponse.data.status === 'success') {
        setCompletionPercentage(completionResponse.data.data);
      }
      
      // Refresh overdue milestones count
      const overdueResponse = await chatApis.getOverdueMilestonesForChat(chatRoomId, authToken);
      if (overdueResponse.data.status === 'success') {
        setOverdueMilestones(overdueResponse.data.data.length);
      }
    } catch (err) {
      console.error('Failed to update milestone status:', err);
      setError('Failed to update milestone status');
    }
  }, [chatRoomId, authToken, handleMilestoneNotification]);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }
  
  if (!contractDetails) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Contract details not available.
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Contract details card - compact version */}
      <Card className="mb-2 flex-shrink-0">
        <CardHeader className="py-2 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              Contract: {contractDetails.projectTitle}
            </CardTitle>
            <Badge variant="outline" className={getStatusColor(contractDetails.contractStatus)}>
              {contractDetails.contractStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <DollarSignIcon className="h-3 w-3 text-muted-foreground" />
              <span>${contractDetails.contractAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span>{contractDetails.durationDays} days</span>
            </div>
            
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3 text-muted-foreground" />
              <Progress value={completionPercentage} className="h-2 w-12 inline-block mr-1" />
              <span>{Math.round(completionPercentage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Milestone notification alert */}
      {milestoneNotification && (
        <Alert className="mb-2 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <AlertDescription className="flex items-center justify-between">
            <span>
              {milestoneNotification.action === 'status_change' ? (
                <>
                  Milestone "{milestoneNotification.title}" status changed to{' '}
                  <Badge variant="outline" className={getStatusColor(milestoneNotification.status)}>
                    {milestoneNotification.status}
                  </Badge>
                </>
              ) : (
                <>Milestone "{milestoneNotification.title}" {milestoneNotification.action}</>
              )}
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabs for Chat and Milestones - takes remaining height */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-grow flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="milestones" className="relative">
            Milestones
            {overdueMilestones > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {overdueMilestones}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-2 flex-grow overflow-hidden">
          <ChatInterface 
            chatRoomId={chatRoomId} 
            chatType="CONTRACT" 
            referenceId={contractDetails?.contractId || 0} 
            className="h-full" 
          />
        </TabsContent>
        
        <TabsContent value="milestones" className="mt-2 flex-grow overflow-auto">
          <MilestonePanel 
            contractId={contractDetails.contractId}
            chatRoomId={chatRoomId}
            onMilestoneNotification={handleMilestoneNotification}
            onMilestoneStatusUpdate={handleMilestoneStatusUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 