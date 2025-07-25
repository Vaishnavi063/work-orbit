import useAuth from "@/hooks/use-auth";
import { useMutation } from "react-query";
import apis from "../apis";
import { toast } from "sonner";

interface UseProjectActionsProps {
  refetchProjects: () => void;
}

export interface ProjectUpdateData {
  title: string;
  description: string;
  category: string; 
  budget: number;
  deadline: string;
  clientId: number;
}

const useProjectActions = ({ refetchProjects }: UseProjectActionsProps) => {
  const { authToken } = useAuth();

  const {
    isLoading: isUpdating,
    mutate: updateProject,
  } = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProjectUpdateData }) =>
      apis.updateProject({
        id: projectId,
        authToken: authToken as string,
        data,
      }),
    onSuccess: () => {
      refetchProjects();
      toast.success("Project updated successfully!", {
        description: "Your project has been updated with the new details.",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to update project", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  const {
    isLoading: isDeleting,
    mutate: deleteProject,
  } = useMutation({
    mutationFn: (projectId: string) =>
      apis.deleteProject({
        id: projectId,
        authToken: authToken as string,
      }),
    onSuccess: () => {
      refetchProjects();
      toast.success("Project deleted successfully!", {
        description: "The project has been removed from your list.",
      });
    },
    onError: (err: any) => {
      toast.error("Failed to delete project", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  const handleUpdateProject = (projectId: string, data: ProjectUpdateData) => {
    if (!authToken) {
      toast.error("Authentication required", {
        description: "Please log in again to continue.",
      });
      return;
    }
    updateProject({ projectId, data });
  };

  const handleDeleteProject = (projectId: string) => {
    if (!authToken) {
      toast.error("Authentication required", {
        description: "Please log in again to continue.",
      });
      return;
    }
    deleteProject(projectId);
  };

  return {
    handleUpdateProject,
    handleDeleteProject,
    isUpdating,
    isDeleting,
  };
};

export default useProjectActions;