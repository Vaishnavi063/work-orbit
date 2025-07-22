import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, CalendarIcon, DollarSignIcon, CheckCircleIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
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
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-destructive">
        {error}
      </div>
    );
  }
  
  if (!contractDetails) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Contract details not available.
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Contract details card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Contract: {contractDetails.projectTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(contractDetails.contractStatus)}>
                  {contractDetails.contractStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created on {formatDate(contractDetails.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Contract details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Contract Amount</div>
                  <div className="text-lg">${contractDetails.contractAmount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-lg">{contractDetails.durationDays} days</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Completion</div>
                  <div className="flex items-center gap-2">
                    <Progress value={completionPercentage} className="h-2 w-24" />
                    <span className="text-sm">{Math.round(completionPercentage)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm font-medium mb-1">Client</div>
                <div className="text-sm">{contractDetails.clientName}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Freelancer</div>
                <div className="text-sm">{contractDetails.freelancerName}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Chat and Milestones */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-2">
          <ChatInterface chatRoomId={chatRoomId} />
        </TabsContent>
        
        <TabsContent value="milestones" className="mt-2">
          <MilestonePanel contractId={contractDetails.contractId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 