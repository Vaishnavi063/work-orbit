import { request } from "@/apis";
import type { ProjectCountsResponse } from "@/types";

/**
 * Fetches project counts by category from the backend API
 * @returns Promise<ProjectCountsResponse> - Project counts grouped by category
 */
export const getProjectCounts = async (): Promise<ProjectCountsResponse> => {
    try {
        const response = await request({
            method: "GET",
            url: "/api/projects/counts-by-category",
        });

        return response.data.data || response.data;
    } catch (error: any) {
        // Enhanced error handling with specific error types
        if (error.response?.status === 404) {
            throw new Error("Project counts endpoint not found");
        } else if (error.response?.status === 500) {
            throw new Error("Server error while fetching project counts");
        } else if (error.code === "NETWORK_ERROR" || !error.response) {
            throw new Error("Network error: Unable to connect to server");
        } else if (error.response?.data?.error?.message) {
            throw new Error(error.response.data.error.message);
        } else {
            throw new Error(error.message || "Failed to fetch project counts");
        }
    }
};
