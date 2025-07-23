import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/types";

interface BalanceChartProps {
  currentBalance: number;
  totalWithdrawn: number;
  formatCurrency: (amount: number) => string;
}

const BalanceChart = ({
  currentBalance,
  totalWithdrawn,
  formatCurrency,
}: BalanceChartProps) => {
  const balanceData = useMemo(
    () => [
      {
        name: "Available Balance",
        value: currentBalance,
        color: CHART_COLORS.available,
      },
      {
        name: "Total Withdrawn",
        value: totalWithdrawn,
        color: CHART_COLORS.withdrawn,
      },
    ],
    [currentBalance, totalWithdrawn]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Breakdown</CardTitle>
        <CardDescription>Distribution of your total earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={balanceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {balanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-6 mt-4">
          {balanceData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceChart;
