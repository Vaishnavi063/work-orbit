import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  Clock,
  Users,
  FileText,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import apis from "../apis";
import useAuth from "@/hooks/use-auth";
import { toast } from "sonner";

interface SubmitProposalProps {
  projectId: number;
  refetchBids: () => void;
}

export interface ProposalFormValues {
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
}

interface RaiseBidProps extends ProposalFormValues {
  freelancerId: number;
  projectId: number;
}

const SubmitProposal = ({ projectId, refetchBids }: SubmitProposalProps) => {
  const [open, setOpen] = useState(false);
  const { authToken, user } = useAuth();

  const form = useForm<ProposalFormValues>({
    defaultValues: {
      proposal: "",
      bidAmount: 0,
      durationDays: 0,
      teamSize: 1,
    },
    mode: "onChange",
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: RaiseBidProps) => apis.raiseBid({ data, authToken }),
    onSuccess: () => {
      toast.success("🎉 Bid successfully placed!");
      setOpen(false);
      form.reset();
      refetchBids();
    },
    onError: () => {
      toast.error("You can't raise multiple bids");
      setOpen(false);
    },
  });

  const handleSubmit = (values: ProposalFormValues) => {
    if (!user?.id || !authToken) {
      toast.error("You must be logged in to submit a proposal.");
      return;
    }

    const payload: RaiseBidProps = {
      ...values,
      freelancerId: user.id,
      projectId,
    };

    mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto rounded-lg px-3 py-2 text-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <Sparkles className="w-4 h-4 mr-2" />
          Submit Proposal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gray-800 flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-lg font-semibold text-black">
              Submit Your Proposal
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="proposal"
                rules={{ required: "Proposal description is required" }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="flex items-center space-x-2 text-black font-medium text-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span>Project Proposal</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your approach and what makes you the perfect fit..."
                        className="min-h-[80px] resize-none border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 rounded-lg p-3 text-sm"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="bidAmount"
                  rules={{
                    required: "Bid amount is required",
                    min: { value: 0, message: "Must be at least 0" },
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-black font-medium text-sm">
                        Bid Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                          <Input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            placeholder="Amount"
                            className="pl-9 py-2 border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 rounded-lg text-sm"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                field.onChange(
                                  value === "" ? undefined : value
                                );
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value !== "") {
                                field.onChange(parseFloat(value) || 0);
                              }
                            }}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-black font-medium text-sm">
                        Duration
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Days"
                            className="pl-9 pr-10 py-2 border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 rounded-lg text-sm"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d*$/.test(value)) {
                                field.onChange(
                                  value === "" ? undefined : value
                                );
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value !== "") {
                                field.onChange(parseInt(value, 10) || 0);
                              }
                            }}
                            value={field.value ?? ""}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                            days
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="teamSize"
                rules={{
                  required: "Team size is required",
                  min: { value: 1, message: "Must be at least 1" },
                }}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-black font-medium text-sm">
                      Team Size
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Team size"
                          className="pl-9 pr-14 py-2 border-gray-300 focus:border-black focus:ring-1 focus:ring-gray-200 rounded-lg text-sm"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*$/.test(value)) {
                              field.onChange(value === "" ? undefined : value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value !== "") {
                              field.onChange(parseInt(value, 10) || 1);
                            }
                          }}
                          value={field.value ?? ""}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                          people
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-3">
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border-gray-300 text-black hover:bg-gray-100 py-2 text-sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                    className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 py-2 text-sm"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Place Bid</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitProposal;
