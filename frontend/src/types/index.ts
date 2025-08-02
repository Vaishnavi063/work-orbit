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
    path?: string;
    isProtected: boolean;
    icon: LucideIcon;
    action?: () => void; // For contact form trigger and other action-based navigation
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
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
}

export interface ProfileData {
  name: string;
  email: string;
  rating: number;
  skills: string[];
  pastWorks: PastWork[];
}

// Utility interface for timeline display information
export interface TimelineInfo {
  isOngoing: boolean;
  duration: string;
  formattedStartDate: string;
  formattedEndDate: string;
  formattedRange: string;
}
// Chat-related types

export interface ChatMessage {
    id: number;
    chatRoomId: number;
    senderType: "CLIENT" | "FREELANCER" | "SYSTEM";
    senderId?: number;
    senderName: string;
    content: string;
    messageType:
        | "TEXT"
        | "SYSTEM_NOTIFICATION"
        | "BID_ACTION"
        | "MILESTONE_UPDATE";
    isRead: boolean;
    createdAt: string;
    status?: "pending" | "delivered" | "error"; // Frontend-only for state management
    isPending?: boolean; // For backward compatibility
}

export interface ChatRoom {
    id: number;
    chatType: "BID_NEGOTIATION" | "CONTRACT";
    referenceId: number;
    otherParty: {
        id: number;
        name: string;
        type: "CLIENT" | "FREELANCER";
    };
    lastMessage?: ChatMessage;
    unreadCount: number;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
}

// Project count types for dynamic category loading
export interface ProjectCountResponse {
    categoryId: number;
    activeProjectCount: number;
    lastUpdated: string;
}

export interface ProjectCountsResponse {
    counts: ProjectCountResponse[];
    totalActiveProjects: number;
}

// Export new feature types
export * from "./contact";
export * from "./api";
export * from "./workflow";
