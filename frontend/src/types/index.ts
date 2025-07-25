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
    id:number;
    title: string;
    category: string;
    budget: number;
    deadline: string; 
  };
}


export interface Transaction {
  projectId: number;
  projectTitle: string;
  clientName: string;
  amount: number;
  receivedAt: string;
  status: string;
}

export interface RevenueData {
  freelancerId: number;
  freelancerName: string;
  totalEarnings: number;
  currentBalance: number;
  totalWithdrawn: number;
  completedProjects: number;
  recentTransactions: Transaction[];
  monthlyBreakdown: {
    currentMonth: number;
    lastMonth: number;
    currentYear: number;
  };
}

export const CHART_COLORS = {
  available: "#22c55e",
  withdrawn: "#f59e0b",
  bar: "#8884d8",
} as const;


export type Wallet = {
  walletId: number;
  userId: number;
  role: string;
  availableBalance: number;
  frozenBalance: number;
};

export type FrozenAmount = {
  projectId: number;
  projectTitle: string;
  freelancerName: string;
  frozenAmount: number;
  status: 'FROZEN' | 'RELEASED';
};

// components/profile/types.ts
export interface PastWork {
  id: number;
  title: string;
  link: string;
  description: string;
}

export interface ProfileData {
  name: string;
  email: string;
  rating: number;
  skills: string[];
  pastWorks: PastWork[];
}