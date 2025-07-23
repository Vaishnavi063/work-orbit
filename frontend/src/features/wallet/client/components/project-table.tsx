import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { FrozenAmount } from "@/types";

interface FrozenAmountsTableProps {
  frozenAmounts: FrozenAmount[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const FrozenAmountsTable = ({ frozenAmounts }: FrozenAmountsTableProps) => {
  const safeAmounts = Array.isArray(frozenAmounts) ? frozenAmounts : [];

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
        Frozen Amounts
      </h2>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[180px]">Project</TableHead>
              <TableHead className="min-w-[160px]">Freelancer</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {safeAmounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No frozen amounts found.
                </TableCell>
              </TableRow>
            ) : (
              safeAmounts.map((item) => (
                <TableRow
                  key={item.projectId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-zinc-800 dark:text-zinc-100">
                    {item.projectTitle}
                  </TableCell>
                  <TableCell className="text-zinc-700 dark:text-zinc-300">
                    {item.freelancerName}
                  </TableCell>
                  <TableCell className="text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(item.frozenAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "FROZEN"
                          ? "default"
                          : item.status === "RELEASED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FrozenAmountsTable;
