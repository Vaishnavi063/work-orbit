import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

interface WithdrawMoneyDialogProps {
  currentBalance: number;
  onWithdraw: (amount: number) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const MINIMUM_WITHDRAWAL = 10;

const WithdrawMoneyDialog: React.FC<WithdrawMoneyDialogProps> = ({
  currentBalance,
  onWithdraw,
  isOpen,
  onOpenChange,
  trigger,
}) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const validateAmount = useCallback(
    (amount: number): string | null => {
      if (!amount || amount <= 0) return "Please enter a valid amount";
      if (amount > currentBalance) return "Insufficient balance";
      if (amount < MINIMUM_WITHDRAWAL)
        return `Minimum withdrawal amount is ₹${MINIMUM_WITHDRAWAL}`;
      return null;
    },
    [currentBalance]
  );

  const resetForm = useCallback(() => {
    setWithdrawalAmount("");
    setError("");
    setIsWithdrawing(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  const handleSubmit = async () => {
    setError("");
    const amount = parseFloat(withdrawalAmount);

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsWithdrawing(true);
    try {
      await onWithdraw(amount);
      handleClose();
    } catch (error: any) {
      setError(error.message || "Withdrawal failed. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWithdrawalAmount(e.target.value);
      setError("");
    },
    []
  );

  const isSubmitDisabled =
    isWithdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Enter the amount you want to withdraw from your available balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance Display */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">
                Available Balance
              </span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(currentBalance)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount" className="text-sm font-medium">
              Withdrawal Amount
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={handleAmountChange}
                className="pl-10"
                min={MINIMUM_WITHDRAWAL}
                max={currentBalance}
                step="0.01"
                disabled={isWithdrawing}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Section */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Minimum withdrawal: ₹{MINIMUM_WITHDRAWAL}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Processing time: 1-3 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>No withdrawal fees</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isWithdrawing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="bg-green-600 hover:bg-green-700"
          >
            {isWithdrawing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Withdraw{" "}
                {withdrawalAmount &&
                  formatCurrency(parseFloat(withdrawalAmount))}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawMoneyDialog;
