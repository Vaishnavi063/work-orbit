import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
    CheckIcon,
    XIcon,
    DollarSignIcon,
    CalendarIcon,
    UsersIcon,
    FileTextIcon,
    LoaderCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useErrorHandler } from "@/hooks/use-error-handler";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";

import type { BidResponse } from "../types";
import {
    acceptBid,
    rejectBid,
    updateBidStatusOptimistic,
    selectProjectsLoading,
    selectProjectsError,
} from "@/store/slices/projects-slice";
import type { RootState, AppDispatch } from "@/store";

interface BidListProps {
    bids: BidResponse[];
    projectStatus: "OPEN" | "CLOSED";
    projectId: number;
    isLoading?: boolean;
}

const BidList: React.FC<BidListProps> = ({
    bids,
    projectStatus,
    projectId,
    isLoading = false,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectProjectsLoading);
    const error = useSelector(selectProjectsError);
    const { authToken } = useSelector((state: RootState) => state.auth);
    const { handleError, handleSuccess } = useErrorHandler();

    const [actioningBidId, setActioningBidId] = useState<number | null>(null);

    const handleBidAction = async (
        bidId: number,
        action: "accept" | "reject"
    ) => {
        if (!authToken) {
            handleError("Authentication required", {
                toastTitle: "Authentication Error",
                showToast: true,
            });
            return;
        }

        setActioningBidId(bidId);

        dispatch(
            updateBidStatusOptimistic({
                bidId,
                status: action === "accept" ? "Accepted" : "Rejected",
            })
        );

        try {
            const actionThunk = action === "accept" ? acceptBid : rejectBid;
            const result = await dispatch(
                actionThunk({
                    projectId,
                    bidId,
                    authToken,
                })
            );

            if (actionThunk.fulfilled.match(result)) {
                handleSuccess(
                    action === "accept"
                        ? "Bid accepted successfully!"
                        : "Bid rejected successfully!"
                );
            } else {
                dispatch(
                    updateBidStatusOptimistic({
                        bidId,
                        status: "Pending",
                    })
                );

                handleError(error.bidAction || `Failed to ${action} bid`, {
                    toastTitle: `Failed to ${action} bid`,
                    showToast: true,
                });
            }
        } catch (err) {
            dispatch(
                updateBidStatusOptimistic({
                    bidId,
                    status: "Pending",
                })
            );

            handleError(err as Error, {
                toastTitle: "An unexpected error occurred",
                showToast: true,
            });
        } finally {
            setActioningBidId(null);
        }
    };

    if (isLoading) {
        return <BidListSkeleton />;
    }

    if (bids.length === 0) {
        return <NoBidsMessage />;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Received Bids ({bids.length})
                </h3>
                {projectStatus === "CLOSED" && (
                    <Badge variant="secondary">Project Closed</Badge>
                )}
            </div>

            <div className="space-y-4">
                {bids.map((bid) => (
                    <BidCard
                        key={bid.bidId}
                        bid={bid}
                        projectStatus={projectStatus}
                        onBidAction={handleBidAction}
                        isActioning={actioningBidId === bid.bidId}
                        isLoading={loading.bidAction}
                    />
                ))}
            </div>
        </div>
    );
};

interface BidCardProps {
    bid: BidResponse;
    projectStatus: "OPEN" | "CLOSED";
    onBidAction: (bidId: number, action: "accept" | "reject") => void;
    isActioning: boolean;
    isLoading: boolean;
}

const BidCard: React.FC<BidCardProps> = ({
    bid,
    projectStatus,
    onBidAction,
    isActioning,
    isLoading,
}) => {
    const getStatusColor = (status: BidResponse["status"]) => {
        switch (status) {
            case "Accepted":
                return "default";
            case "Rejected":
                return "destructive";
            default:
                return "secondary";
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
        } catch {
            return "Invalid date";
        }
    };

    const canTakeAction = projectStatus === "OPEN" && bid.status === "Pending";

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base mb-2">
                            Freelancer #{bid.freelancerId}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusColor(bid.status)}>
                                {bid.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Submitted {formatDate(bid.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Bid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="font-medium">
                                ${bid.bidAmount.toLocaleString()}
                            </span>
                            <p className="text-muted-foreground text-xs">
                                Bid Amount
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="font-medium">
                                {bid.durationDays} days
                            </span>
                            <p className="text-muted-foreground text-xs">
                                Duration
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="font-medium">
                                {bid.teamSize} member
                                {bid.teamSize !== 1 ? "s" : ""}
                            </span>
                            <p className="text-muted-foreground text-xs">
                                Team Size
                            </p>
                        </div>
                    </div>
                </div>

                {/* Proposal */}
                {bid.proposal && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Proposal
                            </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed pl-6">
                            {bid.proposal}
                        </CardDescription>
                    </div>
                )}
            </CardContent>

            {canTakeAction && (
                <CardFooter className="flex gap-2">
                    <BidActionButton
                        action="accept"
                        bidId={bid.bidId}
                        onAction={onBidAction}
                        isActioning={isActioning}
                        isLoading={isLoading}
                    />
                    <BidActionButton
                        action="reject"
                        bidId={bid.bidId}
                        onAction={onBidAction}
                        isActioning={isActioning}
                        isLoading={isLoading}
                    />
                </CardFooter>
            )}
        </Card>
    );
};

interface BidActionButtonProps {
    action: "accept" | "reject";
    bidId: number;
    onAction: (bidId: number, action: "accept" | "reject") => void;
    isActioning: boolean;
    isLoading: boolean;
}

const BidActionButton: React.FC<BidActionButtonProps> = ({
    action,
    bidId,
    onAction,
    isActioning,
    isLoading,
}) => {
    const isAccept = action === "accept";
    const buttonText = isAccept ? "Accept" : "Reject";
    const dialogTitle = isAccept ? "Accept Bid" : "Reject Bid";
    const dialogDescription = isAccept
        ? "Are you sure you want to accept this bid? This will close the project and create a contract with the freelancer."
        : "Are you sure you want to reject this bid? This action cannot be undone.";

    const handleAction = () => {
        onAction(bidId, action);
    };

    const isDisabled = isLoading || isActioning;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={isAccept ? "default" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    className="flex-1"
                >
                    {isActioning ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : isAccept ? (
                        <CheckIcon className="mr-2 h-4 w-4" />
                    ) : (
                        <XIcon className="mr-2 h-4 w-4" />
                    )}
                    {buttonText}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dialogDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        className={
                            isAccept
                                ? ""
                                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        }
                    >
                        {buttonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const BidListSkeleton: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-24" />
            </div>

            <div className="space-y-4">
                {Array.from({ length: 1 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {Array.from({ length: 1 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <Skeleton className="h-4 w-4" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="pl-6 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex gap-2">
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 flex-1" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const NoBidsMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
                <FileTextIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bids yet</h3>
            <p className="text-muted-foreground max-w-md">
                No freelancers have submitted bids for this project yet. Bids
                will appear here once freelancers start showing interest in your
                project.
            </p>
        </div>
    );
};

export default BidList;
