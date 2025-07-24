
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export const LoadingState = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full bg-slate-200" />
    <Skeleton className="h-4 w-3/4 bg-slate-200" />
    <Skeleton className="h-4 w-1/2 bg-slate-200" />
  </div>
);

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => (
  <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm font-medium">{message}</span>
  </div>
);