import { NavLink } from "react-router-dom";
import { CircleUserRound, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  SidebarFooter,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/use-logout";

const NavSecondary = () => {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { logout } = useLogout();

  return (
    <SidebarFooter>
      <Separator />
      <SidebarMenu>
        <NavLink
          to={"/dashboard/profile"}
          onClick={() => setOpenMobile(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-lg text-foreground font-medium transition-colors",
              isActive && "bg-gray-300 text-active"
            )
          }
        >
          <CircleUserRound size={18} className="shrink-0" />
          <span className={cn("text-md", !open && !isMobile && "hidden")}>
            Profile
          </span>
        </NavLink>
        <button
          className={cn(
            "flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-lg text-foreground font-medium transition-colors cursor-pointer"
          )}
          onClick={logout}
        >
          <LogOut size={16} className="shrink-0" />
          <span className={cn("text-md", !open && !isMobile && "hidden")}>
            Logout
          </span>
        </button>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default NavSecondary;
