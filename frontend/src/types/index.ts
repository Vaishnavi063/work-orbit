import type { LucideIcon } from "lucide-react";

export interface CategoryType {
  id: number;
  title: string;
  available: number;
  Icon: LucideIcon;
  color: string;
}

export interface RequestType {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
  authToken?: string | null;
  data?: any;
  params?: any;
  url?: string;
  isFormData?: boolean;
}

export type UserRoles = "ROLE_FREELANCER" | "ROLE_CLIENT";

export interface User{
  id?: number;
  name: string;
  email: string;
  role: UserRoles;
  token: string;
}

export interface NavLinkType {
  id: number;
  title: string;
  path: string;
  isProtected: boolean;
  icon: LucideIcon;
}

