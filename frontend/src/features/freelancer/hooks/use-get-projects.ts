// hooks/use-get-projects.ts
import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import apis from "../apis";
import { toast } from "sonner";
import type { SortConfig } from "../components/projects-filters";

const useGetProjects = (searchText = "", sortConfig: SortConfig) => {
  const { authToken } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_PROJECTS", searchText, sortConfig.sortBy, sortConfig.sortDir],
    queryFn: () =>
      apis.getProjects({
        authToken,
        params: { 
          q: searchText,
          sortBy: sortConfig.sortBy,
          sortDir: sortConfig.sortDir
        },
      }),
    onError: (err: any) => {
      toast.error("ERROR", {
        description: err?.response?.data?.message || "Failed to fetch projects",
      });
    },
    retry: false,
    keepPreviousData: true,
  });

  return {
    isLoading,
    refetch,
    projects: response?.data?.data,
    error,
  };
};

export default useGetProjects;