import type { Wallet } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, TrendingUp, Lock } from "lucide-react";
import { AddMoneyDialog } from "./add-money-dialog";

interface WalletSummarysProps {
  wallet: Wallet;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const WalletSummary = ({ wallet }: WalletSummarysProps) => {
  const totalBalance = wallet.availableBalance + wallet.frozenBalance;

  return (
    <Card className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Wallet Summary</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Client Wallet Overview
            </p>
          </div>
          <AddMoneyDialog userId={wallet.userId} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Balance
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Available Balance
                  </p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(wallet.availableBalance)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Frozen Balance
                  </p>
                  <p className="text-xl font-bold text-amber-800 dark:text-amber-200">
                    {formatCurrency(wallet.frozenBalance)}
                  </p>
                </div>
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletSummary;
