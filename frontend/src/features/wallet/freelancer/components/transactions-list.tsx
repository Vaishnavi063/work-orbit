// components/revenue/TransactionsList.tsx
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction } from "@/types";
import { Calendar, CheckCircle, ArrowUpRight } from "lucide-react";

interface TransactionsListProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const TransactionsList = ({
  transactions,
  formatCurrency,
  formatDate,
}: TransactionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Transactions
        </CardTitle>
        <CardDescription>
          Your latest project payments and earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.projectId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{transaction.projectTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    Client: {transaction.clientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.receivedAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-600 flex items-center gap-1">
                  {formatCurrency(transaction.amount)}
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
