/**
 * Utility functions for handling timeline-related API operations and errors
 */

import type { PastWork } from "@/types";

/**
 * Validates timeline data before sending to API
 */
export function validateTimelineData(pastWork: Partial<PastWork>): string | null {
    if (pastWork.startDate && pastWork.endDate) {
        const startDate = new Date(pastWork.startDate);
        const endDate = new Date(pastWork.endDate);

        if (startDate > endDate) {
            return "End date cannot be before start date";
        }
    }

    if (pastWork.startDate) {
        const startDate = new Date(pastWork.startDate);
        const today = new Date();

        if (startDate > today) {
            return "Start date cannot be in the future";
        }
    }

    return null;
}

/**
 * Processes timeline-related API errors and returns user-friendly messages
 */
export function handleTimelineApiError(error: any): string {
  if (!error?.response?.data) {
    return "Failed to update timeline data. Please try again.";
  }

  const errorData = error.response.data;
  
  // Handle validation errors
  if (errorData.errors && Array.isArray(errorData.errors)) {
    const timelineErrors = errorData.errors.filter((err: any) => 
      err.field === "startDate" || err.field === "endDate" || err.field === "dateRange"
    );
    
    if (timelineErrors.length > 0) {
      return timelineErrors[0].message || "Invalid timeline data";
    }
  }
  
  // Handle specific timeline error messages
  if (errorData.message) {
    if (errorData.message.includes("date") || errorData.message.includes("timeline")) {
      return errorData.message;
    }
  }
  
  // Handle error object with nested message
  if (errorData.error?.message) {
    if (errorData.error.message.includes("date") || errorData.error.message.includes("timeline")) {
      return errorData.error.message;
    }
  }
  
  return "Failed to update timeline data. Please try again.";
}

/**
 * Prepares past work data for API submission, ensuring timeline fields are properly formatted
 */
export function preparePastWorkForApi(pastWork: PastWork): any {
  return {
    id: pastWork.id,
    title: pastWork.title,
    link: pastWork.link,
    description: pastWork.description,
    startDate: pastWork.startDate || null,
    endDate: pastWork.endDate || null
  };
}

/**
 * Processes past work data from API response, ensuring timeline fields are properly typed
 */
export function processPastWorkFromApi(pastWork: any): PastWork {
  return {
    id: pastWork.id,
    title: pastWork.title,
    link: pastWork.link,
    description: pastWork.description,
    startDate: pastWork.startDate || undefined,
    endDate: pastWork.endDate || undefined
  };
}

/**
 * Checks if API response contains timeline data
 */
export function hasTimelineData(pastWork: any): boolean {
  return pastWork && (pastWork.startDate !== undefined || pastWork.endDate !== undefined);
}