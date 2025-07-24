import useAuth from "@/hooks/use-auth";
import { useQuery } from "react-query";
import apis from "../apis";
import { toast } from "sonner";

const useGetClientProjects = () => {
  const { authToken, user } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
    error,
  } = useQuery({
    queryKey: ["GET_CLIENT_PROJECTS"],
    queryFn: () =>
      apis.getClientProjects({
        id: String(user?.id),
        authToken: authToken as string,
      }),
    enabled: !!authToken,
    onError: (err: any) => {
      toast.error("Failed to fetch projects", {
        description: err?.response?.data?.message || "Something went wrong.",
      });
    },
    retry: false,
  });

  return {
    isLoading,
    refetch,
    clientProjects: response?.data?.data,
    error,
  };
};

export default useGetClientProjects;
