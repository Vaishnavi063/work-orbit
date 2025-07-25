import { Eye } from "lucide-react";

const EmptyBidsState = () => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
        <Eye className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500 text-lg">No bids found</p>
      <p className="text-slate-400 text-sm mt-1">
        Try selecting a different status filter
      </p>
    </div>
  );
};

export default EmptyBidsState;
