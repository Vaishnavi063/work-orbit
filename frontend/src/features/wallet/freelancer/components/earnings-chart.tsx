// components/revenue/EarningsChart.tsx
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS, type RevenueData } from "@/types";

interface EarningsChartProps {
  monthlyBreakdown: RevenueData["monthlyBreakdown"];
  formatCurrency: (amount: number) => string;
}

const EarningsChart = ({
  monthlyBreakdown,
  formatCurrency,
}: EarningsChartProps) => {
  const earningsComparison = useMemo(
    () => [
      { period: "This Month", amount: monthlyBreakdown.currentMonth },
      { period: "Last Month", amount: monthlyBreakdown.lastMonth },
      { period: "This Year", amount: monthlyBreakdown.currentYear },
    ],
    [monthlyBreakdown]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Comparison</CardTitle>
        <CardDescription>
          Compare your earnings across different periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={earningsComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
            />
            <Bar
              dataKey="amount"
              fill={CHART_COLORS.bar}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EarningsChart;
