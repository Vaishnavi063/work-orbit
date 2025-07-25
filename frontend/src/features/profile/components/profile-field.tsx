import { Card, CardContent } from "@/components/ui/card";
import { Star, User, Mail, Award } from "lucide-react";

interface ProfileFieldProps {
  label: string;
  value?: string;
  variant?: "default" | "success" | "primary" | "rating";
  isLoading?: boolean;
  error?: any;
}

export const ProfileField = ({ 
  label, 
  value, 
  variant = "default",
  isLoading,
  error 
}: ProfileFieldProps) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          card: "border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40",
          text: "text-emerald-700",
          label: "text-emerald-600",
          icon: <User className="w-4 h-4" />
        };
      case "primary":
        return {
          card: "border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-blue-100/40",
          text: "text-blue-700",
          label: "text-blue-600",
          icon: <Mail className="w-4 h-4" />
        };
      case "rating":
        return {
          card: "border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-100/40",
          text: "text-amber-700",
          label: "text-amber-600",
          icon: <Award className="w-4 h-4" />
        };
      default:
        return {
          card: "border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-slate-100/40",
          text: "text-slate-700",
          label: "text-slate-600",
          icon: null
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {config.icon && <span className={config.label}>{config.icon}</span>}
        <label className={`text-xs font-medium ${config.label} uppercase tracking-wide`}>
          {label}
        </label>
      </div>
      
      <Card className={`border ${config.card} transition-all duration-200 hover:shadow-sm`}>
        <CardContent className="p-3">
          {isLoading ? (
            <div className="space-y-1">
              <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs">Failed to load</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {variant === "rating" && value && (
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
              )}
              <p className={`font-medium text-sm ${config.text} break-words line-clamp-2`}>
                {value || 0.0}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};