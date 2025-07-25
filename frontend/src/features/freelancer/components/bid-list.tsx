import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  Calendar,
  IndianRupee,
  MessageSquare,
} from "lucide-react";

type Client = {
  name: string;
  email: string;
  projects: any | null;
};

type Project = {
  id: number;
  title: string;
  description: string;
  category: string | null;
  deadline: string;
  budget: number;
  status: string;
  client: Client;
  clientId: number;
};

type Freelancer = {
  id: number;
  name: string;
  email: string;
};

type Bid = {
  bidId: number;
  freelancerId: number;
  freelancer?: Freelancer;
  project: Project;
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  status: string;
  createdAt: string;
  freelancerName?: string;
};

interface BidListProps {
  bids: Bid[];
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return { className: "bg-green-100 text-green-800", label: "Accepted" };
    case "rejected":
      return { className: "bg-red-100 text-red-800", label: "Rejected" };
    case "pending":
      return { className: "bg-yellow-100 text-yellow-800", label: "Pending" };
    case "under review":
      return { className: "bg-blue-100 text-blue-800", label: "Under Review" };
    default:
      return { className: "bg-gray-100 text-gray-800", label: status };
  }
};

const BidList = ({ bids }: BidListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getFreelancerName = (bid: Bid) => {
    return bid?.freelancerName || `Freelancer #${bid.freelancerId}`;
  };

  const getFreelancerInitials = (bid: Bid) => {
    const name = bid.freelancer?.name;
    if (name) {
      const names = name.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();
    }
    return `F${bid.freelancerId}`;
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-1">No proposals yet</h3>
        <p className="text-sm text-gray-600">
          Proposals will appear here when submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => {
        const statusConfig = getStatusConfig(bid.status);

        return (
          <Card
            key={bid.bidId}
            className="hover:shadow-sm transition-shadow border border-gray-200 bg-gray-50"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                      {getFreelancerInitials(bid)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {getFreelancerName(bid)}
                    </h3>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-green-600" />
                      <span className="font-semibold text-green-700 text-sm">
                        {bid.bidAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  className={`${statusConfig.className} text-xs px-2 py-1`}
                >
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{bid.durationDays}d</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{bid.teamSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(bid.createdAt)}</span>
                </div>
              </div>

              <div className="bg-white rounded-md mt-4 p-3 border border-l-2 border-l-blue-500">
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {bid.proposal}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BidList;
