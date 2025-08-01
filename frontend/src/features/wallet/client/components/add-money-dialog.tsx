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
import { Plus, CreditCard, Wallet, Shield } from "lucide-react";
import { useMutation } from "react-query";
import useAuth from "@/hooks/use-auth";
import { toast } from "sonner";
import type { AddMoneyOrderRequest, VerifyPaymentRequest } from "../apis";
import apis from "../apis";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  userId: number;
  refetchDetails: () => void;
}

const quickAmounts = [500, 1000, 2000, 5000];

interface RazorpayOrderResponse {
  orderId: string;
  razorpayKey: string;
  amount: number;
  currency: string;
  companyName: string;
  description: string;
  userId: number;
}

export const AddMoneyDialog = ({ userId, refetchDetails }: Props) => {
  const { authToken } = useAuth();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Mutation for creating Razorpay order
  const { isLoading: isCreatingOrder, mutate: createOrder } = useMutation({
    mutationFn: (data: AddMoneyOrderRequest) => 
      apis.createAddMoneyOrder({ data, authToken: authToken as string }),
    onSuccess: (response: any) => {
      console.log('🔍 Full API response:', response);

      openRazorpayPayment(response.data.data);
    },
    onError: (error: any) => {
      console.error("Order creation failed:", error);
      toast.error("Failed to create payment order. Please try again.");
    },
  });

  // Mutation for verifying payment
  const { isLoading: isVerifyingPayment, mutate: verifyPayment } = useMutation({
    mutationFn: (data: VerifyPaymentRequest) => 
      apis.verifyPayment({ data, authToken: authToken as string }),
    onSuccess: () => {
      toast.success("🎉 Money added successfully!");
      refetchDetails();
      setAmount("");
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error("Payment verification failed:", error);
      toast.error("Payment verification failed. Please contact support.");
    },
  });

  const openRazorpayPayment = (orderData: RazorpayOrderResponse) => {
    console.log('📦 Received order data:', orderData);
    console.log('📦 Order data type:', typeof orderData);
    console.log('📦 Order data keys:', Object.keys(orderData));
    
    // Check each required field
    console.log('🔍 Validation check:');
    console.log('- orderId:', orderData.orderId, typeof orderData.orderId);
    console.log('- razorpayKey:', orderData.razorpayKey, typeof orderData.razorpayKey);
    console.log('- amount:', orderData.amount, typeof orderData.amount);
    console.log('- userId:', orderData.userId, typeof orderData.userId);

    // Your existing validation code...
    if (!orderData.orderId || !orderData.razorpayKey || !orderData.amount) {
      console.error('❌ Missing required order data:', {
        orderId: !!orderData.orderId,
        razorpayKey: !!orderData.razorpayKey,
        amount: !!orderData.amount,
        userId: !!orderData.userId
      });
      toast.error("Invalid order data received");
      return;
    }
  
    // Use the EXACT same pattern as your working test
    const options = {
      key: orderData.razorpayKey,
      amount: Math.round(orderData.amount * 100), // Ensure it's an integer
      currency: orderData.currency || 'INR',
      order_id: orderData.orderId,
      name: orderData.companyName || 'WorkOrbit',
      description: orderData.description || 'Add money to wallet',
      handler: function(response: any) {
        console.log('✅ Payment successful:', response);
        
        // Payment successful, now verify
        const verificationData: VerifyPaymentRequest = {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          userId: orderData.userId,
          role: "CLIENT",
          amount: orderData.amount,
        };
        
        verifyPayment(verificationData);
      },
      prefill: {
        name: "User",
        email: "user@example.com",
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: function() {
          console.log('❌ Payment cancelled by user');
          toast.info("Payment cancelled");
        },
      },
    };
  
    console.log('🚀 Creating Razorpay with options:', {
      key: options.key,
      amount: options.amount,
      order_id: options.order_id,
      name: options.name
    });
  
    try {
      // Use the exact same approach as your working test
      const razorpay = new window.Razorpay(options);
      console.log('✅ Razorpay instance created:', razorpay);
      razorpay.open();
      console.log('✅ Razorpay opened successfully');
    } catch (error) {
      console.error('❌ Error creating/opening Razorpay:', error);
      toast.error("Failed to open payment gateway. Please try again.");
    }
  };

  const handleAddMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 1) {
      toast.error("Minimum amount is ₹1");
      return;
    }

    if (parseFloat(amount) > 100000) {
      toast.error("Maximum amount is ₹1,00,000");
      return;
    }

    const orderData: AddMoneyOrderRequest = {
      userId,
      role: "CLIENT",
      amount: parseFloat(amount),
    };

    createOrder(orderData);
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

  const isLoading = isCreatingOrder || isVerifyingPayment;

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
                max="100000"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum: ₹1 • Maximum: ₹1,00,000
            </p>
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

          {/* Payment Security Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">
                  Secure payment powered by Razorpay
                </span>
              </div>
            </CardContent>
          </Card>
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
                {isCreatingOrder ? "Creating Order..." : "Verifying Payment..."}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Razorpay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};