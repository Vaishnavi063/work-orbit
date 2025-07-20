import { NavLink, useLocation } from "react-router-dom";
import {
  MessageCircle,
  FilePlus2,
  Briefcase,
  Users,
  Handshake,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";

export const navMain = [
  {
    id: 1,
    title: "Projects",
    path: "/dashboard/browse-projects",
    icon: Briefcase,
    role: "ROLE_FREELANCER",
  },
  {
    id: 2,
    title: "My Bids",
    path: "/dashboard/bids",
    icon: FilePlus2,
    role: "ROLE_FREELANCER",
  },
  {
    id: 3,
    title: "Projects",
    path: "/dashboard/projects",
    icon: Briefcase,
    role: "ROLE_CLIENT",
  },
  {
    id: 4,
    title: "Freelancers",
    path: "/dashboard/freelancers",
    icon: Users,
    role: "ROLE_CLIENT",
  },
  {
    id: 5,
    title: "Contracts",
    path: "/dashboard/contracts",
    icon: Handshake,
    role: "COMMON",
  },
  {
    id: 6,
    title: "Chats",
    path: "/dashboard/chats",
    icon: MessageCircle,
    role: "COMMON",
  },
];

const NavMain = () => {
  const { user } = useAuth();
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  const filteredNav = navMain.filter(
    (item) => item.role === "COMMON" || item.role === user?.role
  );

  return (
    <SidebarContent>
      <SidebarGroup className="space-y-1 my-2">
        {filteredNav.map((item) => {
          return (
            <SidebarMenu key={item.id}>
              <NavLink
                to={`${item.path}`}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-lg text-foreground font-medium transition-colors",
                  pathname.includes(item.path) && "bg-gray-300 text-active"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                <span className={cn(!open && !isMobile && "hidden")}>
                  {item.title}
                </span>
              </NavLink>
            </SidebarMenu>
          );
        })}
      </SidebarGroup>
    </SidebarContent>
  );
};

export default NavMain;
