import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import { toast } from "sonner";
import apis from "../apis";

const useGetWalletDetails = () => {
  const { authToken, user } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_FROZAN_AMOUNT"],
    queryFn: () =>
      apis.getWalletDetails({
        id: user?.id as number,
        authToken: authToken as string,
        params: {"role": "ROLE_CLIENT"}
      }),
    enabled: !!authToken,
    onError: (err: any) => {
      toast.error("Failed to fetch wallet details", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  return {
    isLoading,
    refetch,
    walletDetails: response?.data?.data,
    error,
  };
};

export default useGetWalletDetails;
