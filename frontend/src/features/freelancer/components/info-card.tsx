import type { InfoCardProps } from "@/types";

// Helper Component for Metadata
const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  className = "",
}) => (
  <div
    className={`flex items-start gap-3 rounded-lg border border-slate-200 p-3 ${className}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default InfoCard;
