/**
 * Contract type definitions
 */

/**
 * Contract interface representing a contract between a client and freelancer
 */
export interface Contract {
  contractId: number;
  projectId: number;
  projectTitle: string;
  bidId: number;
  clientId: number;
  clientName: string;
  freelancerId: number;
  freelancerName: string;
  bidAmount: number;
  contractStatus: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contract status enum
 */
export enum ContractStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: any;
}

/**
 * Contract status update request type
 */
export interface ContractStatusUpdateRequest {
  contractStatus: ContractStatus;
}

/**
 * Contract list response type
 */
export type ContractsResponse = ApiResponse<Contract[]>;

/**
 * Single contract response type
 */
export type ContractResponse = ApiResponse<Contract>;