import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, CalendarIcon, DollarSignIcon, CheckCircleIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface ContractChatProps {
  chatRoomId: number;
  className?: string;
}

export const ContractChat = ({ chatRoomId, className }: ContractChatProps) => {
  const [contractDetails, setContractDetails] = useState<ContractDetailsResponse | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Fetch contract details
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
            const completionResponse = await fetch(
              `/api/milestones/contract/${response.data.data.contractId}/completion`,
              {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            const completionData = await completionResponse.json();
            if (completionData.status === 'success') {
              setCompletionPercentage(completionData.data);
            }
          } catch (err) {
            console.error('Failed to fetch completion percentage:', err);
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
  
  // Format date function removed as it's not used
  
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
      
      {/* Tabs for Chat and Milestones - takes remaining height */}
      <Tabs defaultValue="chat" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-2 flex-grow overflow-hidden">
          <ChatInterface chatRoomId={chatRoomId} className="h-full" />
        </TabsContent>
        
        <TabsContent value="milestones" className="mt-2 flex-grow overflow-auto">
          <MilestonePanel contractId={contractDetails.contractId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 