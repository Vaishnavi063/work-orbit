import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Wallet } from "lucide-react";
import { useMutation } from "react-query";
import apis from "../apis";
import useAuth from "@/hooks/use-auth";
import { toast } from "sonner";

interface Props {
  userId: number;
  refetchDetails: () => void;
}

const quickAmounts = [500, 1000, 2000, 5000];

interface WalletTransaction {
  userId: number;
  role: "ROLE_CLIENT";
  amount: number;
}

export const AddMoneyDialog = ({ userId, refetchDetails }: Props) => {
  const { authToken } = useAuth();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: WalletTransaction) => apis.addMoney({ data, authToken }),
    onSuccess: () => {
      toast.success("🎉 Money added successfully!");
      refetchDetails();
      setAmount("");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const transactionData: WalletTransaction = {
      userId,
      role: "ROLE_CLIENT",
      amount: parseFloat(amount),
    };

    mutate(transactionData);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hover:bg-primary/85 cursor-pointer text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Money
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Add Money to Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet for seamless project payments and
            transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="h-10"
                  disabled={isLoading}
                >
                  {formatCurrency(quickAmount)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Custom Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                min="1"
                step="0.01"
                disabled={isLoading}
              />
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Amount to Add</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    ₹{parseFloat(amount).toLocaleString("en-IN")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMoney}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="hover:bg-primary/85 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
