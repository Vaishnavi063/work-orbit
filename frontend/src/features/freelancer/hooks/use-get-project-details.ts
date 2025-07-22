import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import apis from "../apis";
import { toast } from "sonner";

const useGetProjectDetails = () => {
  const { authToken } = useAuth();
  const { id } = useParams<{ id?: string }>();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_PROJECT_DETAILS", id],
    queryFn: () => apis.getProjectDetails({ id: id as string, authToken: authToken as string }),
    enabled: !!id && !!authToken, 
    onError: (err: any) => {
      toast.error("Failed to fetch project details", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  return {
    isLoading,
    refetch,
    project: response?.data?.data,
    error,
  };
};

export default useGetProjectDetails;