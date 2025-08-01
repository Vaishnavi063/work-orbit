import { NavLink, useLocation } from "react-router-dom";
import {
  FilePlus2,
  Briefcase,
  SwatchBook,
  Handshake,
  MessageSquare,
  WalletMinimal,
  HandCoins,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { ChatIndicator } from "@/features/chat/components";

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
    title: "My Projects",
    path: "/dashboard/my-projects",
    icon: SwatchBook,
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
    title: "Wallet",
    path: "/dashboard/wallet",
    icon: WalletMinimal,
    role: "ROLE_CLIENT",
  },
  {
    id: 6,
    title: "Revenue",
    path: "/dashboard/revenue",
    icon: HandCoins,
    role: "ROLE_FREELANCER",
  },
  {
    id: 8,
    title: "Chats",
    path: "/dashboard/chats",
    icon: MessageSquare,
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
                <div className="relative">
                  <item.icon size={18} className="shrink-0" />
                  {item.title === "Chats" && (
                    <ChatIndicator className="absolute -top-2 -right-2" />
                  )}
                </div>
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
