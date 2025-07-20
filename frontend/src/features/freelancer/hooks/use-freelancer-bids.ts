import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import apis from "../apis";
import { toast } from "sonner";

const useGetFreelancerBids = () => {
  const { authToken, user } = useAuth();

  const freelancerId = user?.id ? user.id.toString() : undefined;

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_FREELANCER_BIDS", freelancerId],
    queryFn: () =>
      apis.getFreelancerBids({
        id: freelancerId as string, 
        authToken: authToken as string,
      }),
    enabled: !!freelancerId && !!authToken,
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
    freelancerBids: response?.data?.data,
    error,
  };
};

export default useGetFreelancerBids;