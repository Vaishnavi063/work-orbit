import { useCallback } from "react";
import { toast } from "sonner";

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  onError?: (error: any) => void;
  retryAction?: () => void;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: ApiError | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = "Error",
      onError,
      retryAction
    } = options;

    let errorMessage = "An unexpected error occurred";

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (error && typeof error === "object" && error.response?.status) {
      switch (error.response.status) {
        case 401:
          errorMessage = "You are not authorized to perform this action";
          break;
        case 403:
          errorMessage = "Access denied";
          break;
        case 404:
          errorMessage = "The requested resource was not found";
          break;
        case 422:
          errorMessage = "Invalid data provided";
          break;
        case 500:
          errorMessage = "Server error. Please try again later";
          break;
        case 503:
          errorMessage = "Service temporarily unavailable";
          break;
      }
    }

    if (showToast) {
      toast.error(toastTitle, {
        description: errorMessage,
        action: retryAction ? {
          label: "Retry",
          onClick: retryAction
        } : undefined
      });
    }

    onError?.(error);

    return errorMessage;
  }, []);

  const handleSuccess = useCallback((
    message: string,
    options: { title?: string } = {}
  ) => {
    toast.success(options.title || "Success", {
      description: message
    });
  }, []);

  return {
    handleError,
    handleSuccess
  };
};

export default useErrorHandler;