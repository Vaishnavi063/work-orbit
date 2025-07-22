type StatusType = "All" | "Accepted" | "Pending" | "Rejected";

interface BidStatusFilterProps {
  selected: StatusType;
  onChange: (status: StatusType) => void;
}

const statusOptions: StatusType[] = ["All", "Accepted", "Pending", "Rejected"];

const BidStatusFilter = ({ selected, onChange }: BidStatusFilterProps) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {statusOptions.map((status) => {
        const isSelected = selected === status;

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`px-4 py-1.5 rounded-full cursor-pointer text-sm font-medium transition-all border shadow-sm
              ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
              }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
};

export default BidStatusFilter;
