export interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string; // ISO date string
  status: 'OPEN' | 'CLOSED';
  clientId: number;
  createdAt: string;
  updatedAt: string;
  bidCount?: number; // Derived field
}

export interface BidResponse {
  bidId: number;
  freelancerId: number;
  projectId: number;
  proposal: string;
  bidAmount: number;
  durationDays: number;
  teamSize: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string; // ISO date string
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: any;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  clientId: number;
}

export interface BidActionRequest {
  projectId: number;
  bidId: number;
}