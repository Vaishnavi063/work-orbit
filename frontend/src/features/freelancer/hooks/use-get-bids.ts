import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import apis from "../apis";
import { toast } from "sonner";

const useGetBids = () => {
  const { authToken } = useAuth();
  const { id } = useParams<{ id?: string }>();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_PROJECT_BIDS", id],
    queryFn: () => apis.getProjectBids({ id: id as string, authToken: authToken as string }),
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
    bids: response?.data?.data,
    error,
  };
};

export default useGetBids;