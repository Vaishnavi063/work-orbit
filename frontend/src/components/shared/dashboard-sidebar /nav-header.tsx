// nav-header.tsx
import { useNavigate } from "react-router-dom";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Orbit } from "lucide-react";
import { siteConfigs } from "@/apis";

const NavHeader = () => {
  const { isMobile, open } = useSidebar();
  const navigate = useNavigate();

  return (
    <SidebarHeader
      onClick={() => navigate("/")}
      className="cursor-pointer h-16 flex items-center justify-center"
    >
      <div
        className={cn("flex items-center", (isMobile || open) && "space-x-4")}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Orbit className="w-4 h-4 text-white dark:text-primary-foreground" />
        </div>
        {(isMobile || open) && (
          <div className="grid flex-1 text-left text-lg leading-tight">
            <span className="truncate font-semibold text-primary">
              {siteConfigs.name.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </SidebarHeader>
  );
};

export default NavHeader;
