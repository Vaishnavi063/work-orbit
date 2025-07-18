import type { NavLinkType } from "@/types";
import { HomeIcon, LayoutGridIcon } from "lucide-react";

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
];