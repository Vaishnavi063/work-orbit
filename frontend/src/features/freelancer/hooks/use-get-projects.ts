import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import apis from "../apis";
import { toast } from "sonner";

const useGetProjects = () => {
  const { authToken } = useAuth();
  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_PROJECTS"],
    queryFn: () => apis.getProjects({ authToken }),
    onError: (err: any) => {
      toast.error("ERROR", {
        description: err?.response?.data?.message,
      });
    },
    retry: false,
  });
  return {
    isLoading,
    refetch,
    projects: response?.data?.data,
    error,
  };
};

export default useGetProjects;
