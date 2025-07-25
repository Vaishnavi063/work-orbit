import { Button } from "@/components/ui/button";

type StatusType = "All" | "Accepted" | "Pending" | "Rejected";

interface BidStatusFilterProps {
  selected: StatusType;
  onChange: (status: StatusType) => void;
}

const statusOptions: StatusType[] = ["All", "Accepted", "Pending", "Rejected"];

const BidStatusFilter = ({ selected, onChange }: BidStatusFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statusOptions.map((status) => (
        <Button
          key={status}
          variant={selected === status ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(status)}
          className="h-7 px-3 text-sm cursor-pointer"
        >
          {status}
        </Button>
      ))}
    </div>
  );
};

export default BidStatusFilter;
