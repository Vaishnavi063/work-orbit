import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const useSignUpClient = () => {
  const navigate = useNavigate();
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerClient({ data }),
    onSuccess: () => {
      toast.success("Client registered successfully");
      navigate("/auth/sign-in")
    },
    onError: (err:any) => {
      console.log("error: " , err)
      toast.error("Something went wrong",{
        description: err?.response?.data?.error?.password
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpClient;
