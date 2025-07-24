import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import { toast } from "sonner";
import apis from "../apis";

const useGetRevenue = () => {
  const { authToken, user } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_FREELANCER_REVENUE"],
    queryFn: () =>
      apis.getRevenue({
        id: user?.id as number,
        authToken: authToken as string,
      }),
    enabled: !!authToken,
    onError: (err: any) => {
      toast.error("Failed to fetch revenue details", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  return {
    isLoading,
    refetch,
    revenueDetails: response?.data?.data,
    error,
  };
};

export default useGetRevenue;
