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
  TrendingUp,
  Award,
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          variant: "secondary" as const,
          borderColor: "border-l-amber-400",
          bgGradient: "bg-gradient-to-r from-amber-50 to-yellow-50",
          textColor: "text-amber-700",
          iconBg: "bg-gradient-to-r from-amber-400 to-yellow-400",
        };
      case "Accepted":
        return {
          variant: "default" as const,
          borderColor: "border-l-emerald-400",
          bgGradient: "bg-gradient-to-r from-emerald-50 to-green-50",
          textColor: "text-emerald-700",
          iconBg: "bg-gradient-to-r from-emerald-400 to-green-400",
        };
      case "Rejected":
        return {
          variant: "destructive" as const,
          borderColor: "border-l-red-400",
          bgGradient: "bg-gradient-to-r from-red-50 to-rose-50",
          textColor: "text-red-700",
          iconBg: "bg-gradient-to-r from-red-400 to-rose-400",
        };
      default:
        return {
          variant: "outline" as const,
          borderColor: "border-l-slate-400",
          bgGradient: "bg-gradient-to-r from-slate-50 to-gray-50",
          textColor: "text-slate-700",
          iconBg: "bg-gradient-to-r from-slate-400 to-gray-400",
        };
    }
  };

  const statusConfig = getStatusConfig(bid.status);
  const isPending = bid.status === "Pending";

  // Calculate bid difference percentage
  const bidDifference =
    ((bid.bidAmount - bid.project.budget) / bid.project.budget) * 100;
  const isCompetitive = bidDifference <= 0;

  return (
    <>
      <Card
        className={`${statusConfig.borderColor} border-l-4 hover:shadow-lg transition-all duration-200 group bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 backdrop-blur-sm border border-slate-200/60 rounded-lg overflow-hidden hover:scale-[1.01]`}
      >
        <CardContent className="p-3">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <div
                  className={`p-1.5 rounded-md ${statusConfig.iconBg} shadow-sm`}
                >
                  <Award className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-slate-900 transition-colors">
                    {bid.project.title}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-xs font-medium px-2 py-0.5">
                      {bid.project.category}
                    </Badge>
                    <Badge
                      variant={statusConfig.variant}
                      className={`text-xs font-medium px-2 py-0.5 ${statusConfig.bgGradient} ${statusConfig.textColor} border-0 shadow-sm`}
                    >
                      {bid.status}
                    </Badge>
                    {isCompetitive && (
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 text-xs font-medium px-1.5 py-0.5">
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                        Competitive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100 rounded-md"
                >
                  <MoreHorizontal className="h-3 w-3 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {isPending && (
                  <DropdownMenuItem
                    onClick={() => setIsUpdateDialogOpen(true)}
                    className="text-blue-600 focus:text-blue-700 focus:bg-blue-50 text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1.5" />
                    Edit Proposal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
            {/* Project Budget */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 rounded-lg border border-slate-200/50 text-center">
              <div className="flex items-center justify-center mb-1">
                <IndianRupee className="h-3 w-3 text-slate-600" />
              </div>
              <p className="text-xs text-slate-600 font-medium mb-0.5">
                Budget
              </p>
              <p className="text-xs font-bold text-slate-800">
                ₹{(bid.project.budget / 1000).toFixed(0)}k
              </p>
            </div>

            {/* Your Bid */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-2 rounded-lg border border-emerald-200/50 text-center">
              <div className="flex items-center justify-center mb-1">
                <IndianRupee className="h-3 w-3 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-700 font-medium mb-0.5">
                Your Bid
              </p>
              <p className="text-xs font-bold text-emerald-800">
                ₹{(bid.bidAmount / 1000).toFixed(0)}k
              </p>
              {bidDifference !== 0 && (
                <p
                  className={`text-xs font-medium ${
                    bidDifference > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {bidDifference > 0 ? "+" : ""}
                  {bidDifference.toFixed(1)}%
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg border border-blue-200/50 text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-3 w-3 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700 font-medium mb-0.5">
                Duration
              </p>
              <p className="text-xs font-bold text-blue-800">
                {bid.durationDays}d
              </p>
            </div>

            {/* Team Size - Hidden on mobile */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-2 rounded-lg border border-purple-200/50 text-center lg:block hidden">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-3 w-3 text-purple-600" />
              </div>
              <p className="text-xs text-purple-700 font-medium mb-0.5">Team</p>
              <p className="text-xs font-bold text-purple-800">
                {bid.teamSize || 1}
              </p>
            </div>

            {/* Deadline - Hidden on mobile */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 rounded-lg border border-orange-200/50 text-center lg:block hidden">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-3 w-3 text-orange-600" />
              </div>
              <p className="text-xs text-orange-700 font-medium mb-0.5">
                Deadline
              </p>
              <p className="text-xs font-bold text-orange-800">
                {new Date(bid.project.deadline).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Compact Proposal Section */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-2.5 rounded-lg border border-slate-200/50">
            <div className="flex items-center mb-1.5">
              <FileText className="h-3 w-3 text-slate-600 mr-1.5" />
              <span className="text-xs font-semibold text-slate-700">
                Proposal
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {bid.proposal}
            </p>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 lg:hidden">
            {isPending && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpdateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 font-medium px-3 py-1 h-6 text-xs rounded-md transition-all duration-200"
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
              className="bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 hover:from-red-100 hover:to-rose-100 font-medium px-3 py-1 h-6 text-xs rounded-md transition-all duration-200"
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
