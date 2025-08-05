import type { RevenueData } from "@/types";
import { useState, useCallback, useMemo, useEffect } from "react";
import RevenueHeader from "./components/revenue-header";
import MetricCards from "./components/metric-cards";
import BalanceChart from "./components/balace-chart";
import EarningsChart from "./components/earnings-chart";
import TransactionsList from "./components/transactions-list";
import useGetRevenue from "./hooks/use-get-revenue";
import { FullscreenLoader } from "@/components/shared/full-screen-loader";

const RevenueDetail = () => {
  const { revenueDetails, isLoading } = useGetRevenue();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  useEffect(() => {
    if (revenueDetails) {
      setRevenueData(revenueDetails);
    }
  }, [revenueDetails]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const growthPercentage = useMemo(() => {
    if (!revenueData) return 0;
    const { currentMonth, lastMonth } = revenueData.monthlyBreakdown;
    if (lastMonth > 0) {
      return ((currentMonth - lastMonth) / lastMonth) * 100;
    }
    return currentMonth > 0 ? 100 : 0;
  }, [revenueData]);

  const handleWithdrawal = useCallback(
    async (amount: number) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setRevenueData((prev) =>
          prev
            ? {
                ...prev,
                currentBalance: prev.currentBalance - amount,
                totalWithdrawn: prev.totalWithdrawn + amount,
              }
            : null
        );
      } catch (error: any) {
        throw new Error(
          error.message || "Withdrawal failed. Please try again."
        );
      }
    },
    [formatCurrency]
  );

  if (isLoading || !revenueData) {
    return <FullscreenLoader lable="Loading revenue details..." />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <RevenueHeader
        completedProjects={revenueData.completedProjects}
        currentBalance={revenueData.currentBalance}
        onWithdraw={handleWithdrawal}
        isWithdrawDialogOpen={isWithdrawDialogOpen}
        onWithdrawDialogChange={setIsWithdrawDialogOpen}
      />

      <MetricCards
        revenueData={revenueData}
        growthPercentage={growthPercentage}
        formatCurrency={formatCurrency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart
          currentBalance={revenueData.currentBalance}
          totalWithdrawn={revenueData.totalWithdrawn}
          formatCurrency={formatCurrency}
        />

        <EarningsChart
          monthlyBreakdown={revenueData.monthlyBreakdown}
          formatCurrency={formatCurrency}
        />
      </div>

      <TransactionsList
        transactions={revenueData.recentTransactions}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};

export default RevenueDetail;
