import { useState } from "react";
import {
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  Trash2,
  Edit3,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BidType } from "@/types";
import useAuth from "@/hooks/use-auth";
import apis from "../../apis";
import UpdateProposalDialog from "./update-dialog";

interface BidCardProps {
  bid: BidType;
  onRefetch: () => void;
}

const BidCard = ({ bid, onRefetch }: BidCardProps) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { user, authToken } = useAuth();

  const { mutate: deleteBid, isLoading: isDeleting } = useMutation({
    mutationFn: (bidId: string) =>
      apis.deleteBid({
        authToken: authToken!,
        freelancerId: String(user?.id),
        bidId,
      }),
    onSuccess: () => {
      toast.success("Bid deleted successfully");
      onRefetch();
    },
    onError: () => {
      toast.error("Failed to delete bid");
    },
  });

  const handleDelete = () => {
    deleteBid(String(bid.bidId));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "Accepted":
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-l-yellow-400";
      case "Accepted":
        return "border-l-green-400";
      case "Rejected":
        return "border-l-red-400";
      default:
        return "border-l-gray-400";
    }
  };

  const isPending = bid.status === "Pending";

  return (
    <>
      <Card
        className={`border-l-4 ${getStatusColor(
          bid.status
        )} hover:shadow-md transition-all duration-200 group`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                {bid.project.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  {bid.project.category}
                </span>
                <Badge
                  variant={getStatusVariant(bid.status)}
                  className="text-xs"
                >
                  {bid.status}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isPending && (
                  <DropdownMenuItem onClick={() => setIsUpdateDialogOpen(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-400 mb-1">
                <IndianRupee className="h-3 w-3" />
              </div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-semibold text-gray-900">
                {(bid.project.budget / 1000).toFixed(0)}k
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center text-green-500 mb-1">
                <IndianRupee className="h-3 w-3" />
              </div>
              <p className="text-xs text-gray-500">Your Bid</p>
              <p className="text-sm font-semibold text-green-600">
                {(bid.bidAmount / 1000).toFixed(0)}k
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center text-blue-500 mb-1">
                <Clock className="h-3 w-3" />
              </div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-blue-600">
                {bid.durationDays}d
              </p>
            </div>

            <div className="text-center lg:block hidden">
              <div className="flex items-center justify-center text-purple-500 mb-1">
                <Users className="h-3 w-3" />
              </div>
              <p className="text-xs text-gray-500">Team</p>
              <p className="text-sm font-semibold text-purple-600">
                {bid.teamSize || 1}
              </p>
            </div>

            <div className="text-center lg:block hidden">
              <div className="flex items-center justify-center text-orange-500 mb-1">
                <Calendar className="h-3 w-3" />
              </div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="text-sm font-semibold text-orange-600">
                {new Date(bid.project.deadline).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center mb-2">
              <FileText className="h-3 w-3 text-gray-400 mr-2" />
              <span className="text-xs font-medium text-gray-600">
                Proposal
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {bid.proposal}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 lg:hidden">
            {isPending && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpdateDialogOpen(true)}
                className="text-blue-600 cursor-pointer border-blue-200 hover:bg-blue-50 text-xs px-2 py-1 h-7"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 cursor-pointer border-red-200 hover:bg-red-50 text-xs px-2 py-1 h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              {isDeleting ? "..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpdateProposalDialog
        bid={bid}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onSuccess={onRefetch}
      />
    </>
  );
};

export default BidCard;
