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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
    <Sheet open={open} onOpenChange={setOpen} modal={false}>
      <SheetTrigger asChild>
        <Button className="group cursor-pointer relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto rounded-lg px-4 py-2 text-sm sm:text-base">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          <Sparkles className="w-4 h-4 mr-2" />
          Submit Proposal
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full max-w-full sm:max-w-md lg:max-w-lg bg-white border-l border-gray-200 overflow-y-auto">
        <SheetHeader className="space-y-2 pb-1 px-5">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-800 shadow-sm flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <SheetTitle className="text-lg sm:text-xl font-semibold text-black leading-tight">
              Submit Your Proposal
            </SheetTitle>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            Craft a compelling proposal that showcases your expertise and
            approach to win this project.
          </p>
        </SheetHeader>

        <Separator className="my-3 sm:my-4 bg-gray-200" />

        <div className="bg-slate-100 border border-gray-100 shadow-lg rounded-md sm:rounded-md p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 mx-1 sm:mx-2 lg:mx-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <FormField
                control={form.control}
                name="proposal"
                rules={{ required: "Proposal description is required" }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center space-x-2 text-black font-medium text-sm sm:text-base">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                      <span>Project Proposal</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your approach, methodology, key milestones, and what makes you the perfect fit for this project..."
                        className="min-h-[100px] sm:min-h-[120px] resize-none border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 rounded-lg bg-gray-50 p-3 sm:p-4 transition-all duration-200 text-sm sm:text-base"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="bidAmount"
                  rules={{
                    required: "Bid amount is required",
                    min: { value: 0, message: "Must be at least 0" },
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-black font-medium text-sm sm:text-base">
                        Bid Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <Input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            placeholder="Enter amount"
                            className="pl-10 sm:pl-12 py-2.5 sm:py-3 border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 rounded-lg bg-gray-50 transition-all duration-200 text-sm sm:text-base"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-black font-medium text-sm sm:text-base">
                        Duration
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter duration"
                            className="pl-10 sm:pl-12 pr-12 sm:pr-14 py-2.5 sm:py-3 border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 rounded-lg bg-gray-50 transition-all duration-200 text-sm sm:text-base"
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
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
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
                  <FormItem className="space-y-2">
                    <FormLabel className="text-black font-medium text-sm sm:text-base">
                      Team Size
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Enter team size"
                          className="pl-10 sm:pl-12 pr-16 sm:pr-20 py-2.5 sm:py-3 border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 rounded-lg bg-gray-50 transition-all duration-200 text-sm sm:text-base"
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
                        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm">
                          people
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="pt-2 sm:pt-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="w-full sm:flex-1 rounded-lg border-gray-300 text-black hover:bg-gray-100 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                    className="group w-full sm:flex-1 relative overflow-hidden bg-black hover:bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 py-2.5 sm:py-3 text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 bg-gray-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
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
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SubmitProposal;
