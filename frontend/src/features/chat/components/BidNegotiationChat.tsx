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
  
  if (!bidDetails) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        Bid details not available.
      </div>
    );
  }
  
  return (
    <div className={cn("grid grid-cols-1 gap-4", className)}>
      {/* Bid details card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Bid for: {bidDetails.projectTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(bidDetails.status)}>
                  {bidDetails.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted on {formatDate(bidDetails.createdAt)}
                </span>
              </div>
              
              {/* Bid action buttons */}
              {(bidDetails.canAccept || bidDetails.canReject) && (
                <div className="flex gap-2">
                  {bidDetails.canAccept && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Accept Bid
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
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XIcon className="h-4 w-4 mr-1" />
                              Reject Bid
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
            
            {/* Bid details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Bid Amount</div>
                  <div className="text-lg">${bidDetails.bidAmount.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-lg">{bidDetails.durationDays} days</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Team Size</div>
                  <div className="text-lg">{bidDetails.teamSize} {bidDetails.teamSize === 1 ? 'person' : 'people'}</div>
                </div>
              </div>
            </div>
            
            {/* Proposal */}
            <div className="pt-2">
              <div className="text-sm font-medium mb-1">Proposal</div>
              <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {bidDetails.proposal}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Chat interface */}
      <ChatInterface chatRoomId={chatRoomId} />
    </div>
  );
}; 