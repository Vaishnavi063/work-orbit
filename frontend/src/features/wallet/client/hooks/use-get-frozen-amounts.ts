import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import { toast } from "sonner";
import apis from "../apis";

const useGetFrozenAmount = () => {
  const { authToken, user } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_FROZAN_AMOUNT"],
    queryFn: () =>
      apis.getFrozanAmount({
        id: user?.id as number,
        authToken: authToken as string,
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
    frozanAmount: response?.data?.data,
    error,
  };
};

export default useGetFrozenAmount;
