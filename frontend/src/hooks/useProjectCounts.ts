import { useState, useEffect, useCallback } from "react";
import { getProjectCounts } from "@/apis";
import type { ProjectCountResponse } from "@/types";

interface ProjectCountsState {
  counts: ProjectCountResponse[];
  totalActiveProjects: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage project counts loading state and data fetching
 * Implements single API call on component mount with error handling and retry logic
 */
export const useProjectCounts = () => {
  const [state, setState] = useState<ProjectCountsState>({
    counts: [],
    totalActiveProjects: 0,
    isLoading: true,
    error: null,
  });

  /**
   * Fetches project counts with error handling and state management
   */
  const fetchProjectCounts = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await getProjectCounts();
      
      setState({
        counts: response.counts || [],
        totalActiveProjects: response.totalActiveProjects || 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch project counts";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

    }
  }, []);

  /**
   * Manual retry function for failed requests
   */
  const retry = useCallback(() => {
    fetchProjectCounts();
  }, [fetchProjectCounts]);

  /**
   * Get project count for a specific category ID
   */
  const getCountForCategory = useCallback((categoryId: number): number | undefined => {
    const categoryCount = state.counts.find(count => count.categoryId === categoryId);
    return categoryCount?.activeProjectCount;
  }, [state.counts]);

  // Fetch project counts on component mount (single API call as specified)
  useEffect(() => {
    fetchProjectCounts();
  }, []); // Empty dependency array ensures single call on mount

  return {
    // State data
    counts: state.counts,
    totalActiveProjects: state.totalActiveProjects,
    isLoading: state.isLoading,
    error: state.error,
    
    // Utility functions
    retry,
    getCountForCategory,
  };
};