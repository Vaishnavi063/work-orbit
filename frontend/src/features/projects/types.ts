import { z } from "zod";

export interface Project {
    id: number;
    title: string;
    description: string;
    budget: number;
    category: string;
    deadline: string;
    status: "OPEN" | "CLOSED";
    clientId: number;
    createdAt: string;
    updatedAt: string;
    bidCount?: number;
}

export interface BidResponse {
    bidId: number;
    freelancerId: number;
    projectId: number;
    proposal: string;
    bidAmount: number;
    durationDays: number;
    teamSize: number;
    status: "Pending" | "Accepted" | "Rejected";
    createdAt: string;
}

export interface ApiResponse<T> {
    status: "success" | "error";
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

export const projectCreateFormSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title is required." })
        .max(100, { message: "Title must not be longer than 100 characters." }),

    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters." })
        .max(1000, {
            message: "Description must not be longer than 1000 characters.",
        }),

    budget: z
        .number()
        .min(1, { message: "Budget must be greater than 0." })
        .positive({ message: "Budget must be a positive number." }),

    category: z.string().min(1, { message: "Category is required." }),

    deadline: z
        .date()
        .min(new Date(), { message: "Deadline must be in the future." }),
});

export type ProjectCreateFormValues = z.infer<typeof projectCreateFormSchema>;

export interface ProjectFormData {
    title: string;
    description: string;
    budget: number;
    category: string;
    deadline: Date;
}

export interface GetProjectsResponse {
    projects: Project[];
    total: number;
}

export interface ProjectDetailsResponse {
    project: Project;
    bids: BidResponse[];
}
