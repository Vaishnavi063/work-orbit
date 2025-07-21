import {
  Calendar,
  Clock,
  IndianRupee,
  FileText,
  Trash2,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useState } from "react";
import useGetFreelancerBids from "../hooks/use-freelancer-bids";
import type { BidType } from "@/types";
import { useMutation } from "react-query";
import apis from "../apis";
import { toast } from "sonner";
import useAuth from "@/hooks/use-auth";
import { FullscreenLoader } from "@/components/shared/full-screen-loader";
import BidStatusFilter from "./bid-filter";

const FreelancerBids = () => {
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Accepted" | "Pending" | "Rejected"
  >("All");

  const { freelancerBids, refetch, isLoading } = useGetFreelancerBids();
  const { user, authToken } = useAuth();

  const { mutate } = useMutation({
    mutationFn: (bidId: string) =>
      apis.deleteBid({
        authToken: authToken!,
        freelancerId: String(user?.id),
        bidId,
      }),
    onSuccess: () => {
      toast.success("🎉 Bid successfully deleted!");
      refetch();
    },
    onError: () => {
      toast.error("⚠️ Error deleting bid. Please try again.");
    },
  });

  const handleDelete = (bidId: number | string) => {
    mutate(String(bidId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200";
      case "Accepted":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200";
      default:
        return "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200";
    }
  };

  const filteredBids =
    statusFilter === "All"
      ? freelancerBids
      : freelancerBids?.filter((bid: any) => bid.status === statusFilter);

  if (isLoading) {
    return <FullscreenLoader lable="Bids Loading..." />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            My Active Bids
          </h1>
        </div>
        <p className="text-slate-600 ml-13">
          Track and manage your project proposals
        </p>
      </div>

      <BidStatusFilter selected={statusFilter} onChange={setStatusFilter} />

      {!filteredBids || filteredBids.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg">No bids found</p>
          <p className="text-slate-400 text-sm mt-1">
            Try selecting a different status filter
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBids.map((bid: BidType) => {
            const isPending = bid.status === "Pending";
            const isAccepted = bid.status === "Accepted";

            return (
              <div
                key={bid.bidId}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isAccepted
                      ? "bg-gradient-to-r from-emerald-400 to-green-500"
                      : isPending
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                      : "bg-gradient-to-r from-slate-400 to-gray-500"
                  }`}
                />

                <div className="p-4 pb-3">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-slate-900 transition-colors">
                        {bid.project.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                          {bid.project.category}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold border px-2 py-1 rounded-full ${getStatusColor(
                        bid.status
                      )}`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Budget</p>
                        <p className="font-semibold text-slate-800">
                          ₹{bid.project.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">Deadline</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(bid.project.deadline).toLocaleDateString(
                            "en-IN",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Your Bid</p>
                        <p className="font-semibold text-emerald-600">
                          ₹{bid.bidAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="font-semibold text-orange-600">
                          {bid.durationDays}d
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-3 w-3 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">
                          Proposal
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {bid.proposal}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(bid.bidId)}
                      className="flex cursor-pointer items-center gap-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-md transition-all duration-200 text-xs font-medium"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FreelancerBids;
