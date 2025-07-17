import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  MessageCircle,
  FilePlus2,
  Briefcase,
  Users,
  Handshake,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const userRole = "freelancer";

export const navMain = [
  {
    id: 1,
    title: "Projects",
    path: "/dashboard/projects",
    icon: Briefcase,
    endPoint: "browse-projects",
    role: "freelancer",
  },
  {
    id: 2,
    title: "My Bids",
    path: "/dashboard/bids",
    icon: FilePlus2,
    endPoint: "my-bids",
    role: "freelancer",
  },
  {
    id: 3,
    title: "Projects",
    path: "/dashboard/projects",
    icon: Briefcase,
    endPoint: "projects",
    role: "client",
  },
  {
    id: 4,
    title: "Freelancers",
    path: "/dashboard/freelancers",
    icon: Users,
    endPoint: "browse",
    role: "client",
  },
  {
    id: 5,
    title: "Contracts",
    path: "/dashboard/contracts",
    icon: Handshake,
    endPoint: "contracts",
    role: "common",
  },
  {
    id: 6,
    title: "Chats",
    path: "/dashboard/chats",
    icon: MessageCircle,
    endPoint: "channels",
    role: "common",
  },
];

const NavMain = () => {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  const filteredNav = navMain.filter(
    (item) => item.role === "common" || item.role === userRole
  );

  return (
    <SidebarContent>
      <SidebarGroup className="space-y-1 my-2">
        {filteredNav.map((item) => {
          return (
            <SidebarMenu key={item.id}>
              <NavLink
                to={`${item.path}/${item.endPoint}`}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center space-x-2 hover:bg-muted p-2 rounded-lg text-foreground font-medium transition-colors",
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
