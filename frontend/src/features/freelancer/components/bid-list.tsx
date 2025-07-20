import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users, Calendar, IndianRupee } from "lucide-react";

type Bid = {
  bidId: number;
  freelancerId: number;
  projectId: number;
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  status: string;
  createdAt: string;
};

interface BidListProps {
  bids: Bid[];
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "secondary";
    case "under review":
      return "outline";
    default:
      return "secondary";
  }
};

const BidList = ({ bids }: BidListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (freelancerId: number) => {
    return `F${freelancerId}`;
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Project Bids</h2>
        <Badge
          variant="outline"
          className="px-3 py-1 bg-blue-100 text-blue-700 border-blue-200"
        >
          {bids.length} {bids.length === 1 ? "bid" : "bids"}
        </Badge>
      </div>

      <div className="grid gap-4">
        {bids.map((bid) => (
          <Card
            key={bid.bidId}
            className="group hover:shadow-lg transition-all duration-300 border shadow-md bg-gray-50"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                      {getInitials(bid.freelancerId)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-foreground">
                        {bid.bidAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Freelancer #{bid.freelancerId}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={getStatusVariant(bid.status)}
                  className="font-medium px-3 py-1"
                >
                  {bid.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Duration:</span>
                  <span className="text-muted-foreground">
                    {bid.durationDays} days
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Team Size:</span>
                  <span className="text-muted-foreground">{bid.teamSize}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Submitted:</span>
                  <span className="text-muted-foreground">
                    {formatDate(bid.createdAt)}
                  </span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">
                  Proposal
                </h4>
                <div className="bg-white rounded-lg p-4 border-l-4 border-l-primary/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {bid.proposal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bids.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <IndianRupee className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No bids yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              When freelancers submit bids for your project, they'll appear
              here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BidList;
