import type { NavLinkType } from "@/types";
import { HomeIcon, LayoutGridIcon, MessageSquareIcon } from "lucide-react";

export const NAV_LINKS: NavLinkType[] = [
  {
    id: 1,
    title: "Home",
    isProtected: false,
    path: "/",
    icon: HomeIcon,
  },
  {
    id: 2,
    title: "Dashboard",
    isProtected: true,
    path: "/dashboard/profile",
    icon: LayoutGridIcon,
  },
  {
    id: 3,
    title: "Contact Us",
    isProtected: false,
    icon: MessageSquareIcon,
    // action will be set dynamically in the component
  },
];