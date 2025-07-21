import { LoaderIcon } from "lucide-react";

interface FullScreenLoaderProps {
  lable?: string;
}
export const FullscreenLoader = ({ lable }: FullScreenLoaderProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <LoaderIcon className="size-6 text-muted-foreground animate-spin" />
      {lable && <p className="text-sm text-muted-foreground">{lable}</p>}
    </div>
  );
};
