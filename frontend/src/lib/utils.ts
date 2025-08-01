import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Timeline utility functions for PastWork

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

/**
 * Formats a date range for display
 */
export function formatDateRange(startDate?: string, endDate?: string): string {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  
  if (!formattedStart && !formattedEnd) return '';
  if (!formattedStart) return formattedEnd;
  if (!formattedEnd) return `${formattedStart} - Present`;
  
  return `${formattedStart} - ${formattedEnd}`;
}

/**
 * Determines if a project is ongoing (has start date but no end date)
 */
export function isProjectOngoing(startDate?: string, endDate?: string): boolean {
  return Boolean(startDate && !endDate);
}

/**
 * Calculates project duration in a human-readable format
 */
export function calculateProjectDuration(startDate?: string, endDate?: string): string {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} year${years === 1 ? '' : 's'}`;
    }
    
    return `${years} year${years === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  }
}

/**
 * Validates that start date is not after end date
 */
export function isValidDateRange(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true; // Allow null dates
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    
    return start <= end;
  } catch {
    return false;
  }
}

/**
 * Validates a date string format
 */
export function isValidDate(dateString?: string): boolean {
  if (!dateString) return true; // Allow null dates
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Creates timeline information object from PastWork dates
 */
export function getTimelineInfo(startDate?: string, endDate?: string): {
  isOngoing: boolean;
  duration: string;
  formattedStartDate: string;
  formattedEndDate: string;
  formattedRange: string;
} {
  return {
    isOngoing: isProjectOngoing(startDate, endDate),
    duration: calculateProjectDuration(startDate, endDate),
    formattedStartDate: formatDate(startDate),
    formattedEndDate: formatDate(endDate),
    formattedRange: formatDateRange(startDate, endDate)
  };
}
