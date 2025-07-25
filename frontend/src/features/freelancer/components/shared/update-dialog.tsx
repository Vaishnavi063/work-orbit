import { useState } from "react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Clock, FileText, Users } from "lucide-react";
import type { BidType } from "@/types";
import useAuth from "@/hooks/use-auth";
import apis from "../../apis";

interface UpdateProposalDialogProps {
  bid: BidType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const UpdateProposalDialog = ({
  bid,
  open,
  onOpenChange,
  onSuccess,
}: UpdateProposalDialogProps) => {
  const [proposal, setProposal] = useState(bid.proposal);
  const [bidAmount, setBidAmount] = useState(bid.bidAmount.toString());
  const [durationDays, setDurationDays] = useState(bid.durationDays.toString());
  const [teamSize, setTeamSize] = useState(bid.teamSize?.toString() || "1");

  const { user, authToken } = useAuth();

  console.log("FREELancer");

  const { mutate: updateBid, isLoading } = useMutation({
    mutationFn: (updateData: {
      projectId: string;
      freelancerId: string;
      proposal: string;
      bidAmount: number;
      durationDays: number;
      teamSize: number;
    }) =>
      apis.updateBid({
        authToken: authToken!,
        freelancerId: String(user?.id),
        bidId: String(bid.bidId),
        data: updateData,
      }),
    onSuccess: () => {
      toast.success("🎉 Proposal updated successfully!");
      onOpenChange(false);
      onSuccess();
    },
    onError: () => {
      toast.error("⚠️ Error updating proposal. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposal.trim()) {
      toast.error("Please enter a proposal");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (!durationDays || parseInt(durationDays) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    if (!teamSize || parseInt(teamSize) <= 0) {
      toast.error("Please enter a valid team size");
      return;
    }

    updateBid({
      projectId: String(bid.project?.id),
      freelancerId: String(user?.id),
      proposal: proposal.trim(),
      bidAmount: parseFloat(bidAmount),
      durationDays: parseInt(durationDays),
      teamSize: parseInt(teamSize),
    });
  };

  const handleClose = () => {
    setProposal(bid.proposal);
    setBidAmount(bid.bidAmount.toString());
    setDurationDays(bid.durationDays.toString());
    setTeamSize(bid.teamSize?.toString() || "1");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Update Proposal
          </DialogTitle>
          <DialogDescription>
            Modify your proposal for "{bid.project.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Info */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h4 className="font-medium text-slate-800 mb-2">Project Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Budget:</span>
                <span className="ml-2 font-semibold">
                  ₹{bid.project.budget.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Deadline:</span>
                <span className="ml-2 font-semibold">
                  {new Date(bid.project.deadline).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bid Amount */}
            <div className="space-y-2">
              <Label htmlFor="bidAmount" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                Bid Amount (₹)
              </Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                min="1"
                step="0.01"
                required
                className="w-full"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Duration (Days)
              </Label>
              <Input
                id="duration"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="Enter duration"
                min="1"
                required
                className="w-full"
              />
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Team Size
              </Label>
              <Input
                id="teamSize"
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="Team members"
                min="1"
                max="50"
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Proposal */}
          <div className="space-y-2">
            <Label htmlFor="proposal" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Proposal
            </Label>
            <Textarea
              id="proposal"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Describe your approach and why you're the best fit for this project..."
              rows={6}
              className="resize-none"
              maxLength={1000}
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">
                {proposal.length}/1000 characters
              </p>
              {proposal.length > 900 && (
                <p className="text-xs text-amber-600">
                  ⚠️ Approaching character limit
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Proposal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProposalDialog;
