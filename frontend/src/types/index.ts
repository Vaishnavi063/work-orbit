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

export interface User {
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

export interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

export type ProjectStatus = "OPEN" | "CLOSED";

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: ProjectStatus;
  deadline: string; // ISO date string
  // Add more fields as needed (e.g., skills, poster, etc.)
}


export interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

export interface BidType {
  bidId: string;
  status: "Pending" | "Accepted" | "Rejected";
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  proposal: string;
  project: {
    title: string;
    category: string;
    budget: number;
    deadline: string; 
  };
}