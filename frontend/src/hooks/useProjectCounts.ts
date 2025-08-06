import { useCallback } from "react";
import { useQuery } from "react-query";
import { getProjectCounts } from "@/apis";
import { CATEGORIES } from "@/constants/categories";
import type { CategoryType } from "@/types";
import type { ProjectCountResponse } from "@/types/api";

/**
 * Custom hook to manage project counts using React Query
 * Implements automatic deduplication, caching, and refetching
 */
export const useProjectCounts = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery('projectCounts', getProjectCounts, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on failure
    refetchOnMount: false // Don't refetch when component mounts again
  });

  /**
   * Get project count for a specific category ID
   * Returns the actual count from backend or fallback data if error/not found
   */
  const getCountForCategory = useCallback((categoryId: number): number => {
    // If there was an error, use fallback data from CATEGORIES
    if (error) {
      const category = CATEGORIES.find((cat: CategoryType) => cat.id === categoryId);
      return category?.available || 0;
    }
    
    // Otherwise use actual data from API
    const categoryCount = data?.counts?.find(count => count.categoryId === categoryId);
    return categoryCount?.activeProjectCount || 0;
  }, [data?.counts, error]);

  // Calculate fallback data for when API fails
  const getFallbackData = () => {
    if (error) {
      // Create a structure similar to the API response using CATEGORIES data
      const fallbackCounts: ProjectCountResponse[] = CATEGORIES.map((cat: CategoryType) => ({
        categoryId: cat.id,
        activeProjectCount: cat.available,
        lastUpdated: new Date()
      }));
      
      // Sum up all available projects for total
      const fallbackTotal: number = CATEGORIES.reduce((sum: number, cat: CategoryType) => sum + cat.available, 0);
      
      return {
        counts: fallbackCounts,
        totalActiveProjects: fallbackTotal
      };
    }
    
    return {
      counts: data?.counts || [],
      totalActiveProjects: data?.totalActiveProjects || 0
    };
  };
  
  const { counts, totalActiveProjects } = getFallbackData();
  
  return {
    // State data
    counts,
    totalActiveProjects,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error fetching counts') : null,
    
    // Utility functions
    retry: refetch,
    getCountForCategory,
  };
};