import { useState } from "react";
import useGetFreelancerBids from "../hooks/use-freelancer-bids";
import { FullscreenLoader } from "@/components/shared/full-screen-loader";
import BidStatusFilter from "./bid-filter";
import EmptyBidsState from "./shared/empty-bid";
import BidCard from "./shared/bid-card";

const FreelancerBids = () => {
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Accepted" | "Pending" | "Rejected"
  >("All");

  const { freelancerBids, refetch, isLoading } = useGetFreelancerBids();

  const filteredBids =
    statusFilter === "All"
      ? freelancerBids
      : freelancerBids?.filter((bid: any) => bid.status === statusFilter);

  if (isLoading) {
    return <FullscreenLoader lable="Loading bids..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Bids</h1>
        <p className="text-gray-600">Track and manage your project proposals</p>
      </div>

      <BidStatusFilter selected={statusFilter} onChange={setStatusFilter} />

      {!filteredBids || filteredBids.length === 0 ? (
        <EmptyBidsState />
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid: any) => (
            <BidCard key={bid.bidId} bid={bid} onRefetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerBids;
