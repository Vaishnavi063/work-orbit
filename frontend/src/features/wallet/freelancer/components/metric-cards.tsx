import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Wallet,
  IndianRupee,
  BanknoteArrowDown,
} from "lucide-react";
import type { RevenueData } from "@/types";

interface MetricCardsProps {
  revenueData: RevenueData;
  growthPercentage: number;
  formatCurrency: (amount: number) => string;
}

const MetricCards = ({
  revenueData,
  growthPercentage,
  formatCurrency,
}: MetricCardsProps) => {
  const metricCards = useMemo(
    () => [
      {
        title: "Total Earnings",
        value: revenueData.totalEarnings,
        icon: IndianRupee,
        color: "green",
        description: "Lifetime earnings",
      },
      {
        title: "Available Balance",
        value: revenueData.currentBalance,
        icon: Wallet,
        color: "blue",
        description: "Ready for withdrawal",
      },
      {
        title: "This Month",
        value: revenueData.monthlyBreakdown.currentMonth,
        icon: TrendingUp,
        color: "purple",
        description: `${
          growthPercentage > 0 ? "+" : ""
        }${growthPercentage.toFixed(1)}% from last month`,
      },
      {
        title: "Total Withdrawn",
        value: revenueData.totalWithdrawn,
        icon: BanknoteArrowDown,
        color: "orange",
        description: "Lifetime withdrawals",
      },
    ],
    [revenueData, growthPercentage]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index} className={`border-l-4 border-l-${metric.color}-500`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 text-${metric.color}-600`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${metric.color}-600`}>
              {formatCurrency(metric.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricCards;
