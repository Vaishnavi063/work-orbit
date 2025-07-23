import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSignIcon, 
  CalendarIcon, 
  UsersIcon, 
  CheckIcon, 
  XIcon, 
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { ChatInterface } from './ChatInterface';
import { chatApis } from '../apis';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface BidDetailsResponse {
  bidId: number;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  status: string;
  createdAt: string;
  canAccept: boolean;
  canReject: boolean;
}

interface BidNegotiationChatProps {
  chatRoomId: number;
  className?: string;
}

export const BidNegotiationChat = ({ chatRoomId, className }: BidNegotiationChatProps) => {
  const [bidDetails, setBidDetails] = useState<BidDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  const navigate = useNavigate();
  
  // Fetch bid details
  useEffect(() => {
    const fetchBidDetails = async () => {
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        const response = await chatApis.getBidDetailsForChat(chatRoomId, authToken);
        setBidDetails(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Failed to load bid details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBidDetails();
  }, [chatRoomId, authToken]);
  
  // Handle bid acceptance
  const handleAcceptBid = async () => {
    if (!authToken || !bidDetails) return;
    
    try {
      setIsProcessing(true);
      await chatApis.acceptBidInChat(bidDetails.bidId, authToken);
      
      // Update local state
      setBidDetails(prev => prev ? { ...prev, status: 'Accepted', canAccept: false, canReject: false } : null);
      
      // Navigate to project page after short delay
      setTimeout(() => {
        navigate(`/dashboard/projects/${bidDetails.projectId}`);
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to accept bid');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle bid rejection
  const handleRejectBid = async () => {
    if (!authToken || !bidDetails) return;
    
    try {
      setIsProcessing(true);
      await chatApis.rejectBidInChat(bidDetails.bidId, authToken);
      
      // Update local state
      setBidDetails(prev => prev ? { ...prev, status: 'Rejected', canAccept: false, canReject: false } : null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to reject bid');
    } finally {
      setIsProcessing(false);
    }
  };
  
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
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rejected':
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
  
  if (!bidDetails) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Bid details not available.
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Bid details card - compact version */}
      <Card className="mb-2 flex-shrink-0">
        <CardHeader className="py-2 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              Bid for: {bidDetails.projectTitle}
            </CardTitle>
            <Badge variant="outline" className={getStatusColor(bidDetails.status)}>
              {bidDetails.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Submitted on {formatDate(bidDetails.createdAt)}
            </span>
            
            {/* Bid action buttons */}
            {(bidDetails.canAccept || bidDetails.canReject) && (
              <div className="flex gap-2">
                {bidDetails.canAccept && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Accept this bid?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create a contract with the freelancer and close the project to other bidders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAcceptBid}>Accept</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {bidDetails.canReject && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="h-7 text-xs"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <XIcon className="h-3 w-3 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this bid?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The freelancer will be notified that their bid was rejected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectBid}>Reject</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <DollarSignIcon className="h-3 w-3 text-muted-foreground" />
              <span>${bidDetails.bidAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <span>{bidDetails.durationDays} days</span>
            </div>
            
            <div className="flex items-center gap-1">
              <UsersIcon className="h-3 w-3 text-muted-foreground" />
              <span>{bidDetails.teamSize} {bidDetails.teamSize === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
          
          {/* Proposal - only show first line with ellipsis */}
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {bidDetails.proposal.split('\n')[0]}
          </div>
        </CardContent>
      </Card>
      
      {/* Chat interface - takes remaining height */}
      <div className="flex-grow overflow-hidden">
        <ChatInterface 
          chatRoomId={chatRoomId} 
          chatType="BID_NEGOTIATION" 
          referenceId={bidDetails?.bidId || 0} 
          className="h-full" 
        />
      </div>
    </div>
  );
}; 