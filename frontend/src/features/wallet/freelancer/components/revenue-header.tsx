import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BanknoteArrowDown } from "lucide-react";
import WithdrawMoneyDialog from "./withdraw-money-dialog";

interface RevenueHeaderProps {
  completedProjects: number;
  currentBalance: number;
  onWithdraw: (amount: number) => Promise<void>;
  isWithdrawDialogOpen: boolean;
  onWithdrawDialogChange: (open: boolean) => void;
}

const RevenueHeader = ({
  completedProjects,
  currentBalance,
  onWithdraw,
  isWithdrawDialogOpen,
  onWithdrawDialogChange,
}: RevenueHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Track your earnings and manage withdrawals
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="w-fit">
          <Activity className="w-4 h-4 mr-2" />
          {completedProjects} Projects Completed
        </Badge>

        <WithdrawMoneyDialog
          currentBalance={currentBalance}
          onWithdraw={onWithdraw}
          isOpen={isWithdrawDialogOpen}
          onOpenChange={onWithdrawDialogChange}
          trigger={
            <Button
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
              disabled={currentBalance <= 0}
            >
              <BanknoteArrowDown className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default RevenueHeader;
