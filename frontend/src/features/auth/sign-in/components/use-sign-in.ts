import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";

const useSignIn = () => {
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      apis.login({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Logging Success")
      console.log("LOGIN DATA -> ", response);
    },
    onError: (err: any) => {
      toast.error("Something went wrong",{
        description: err?.response?.data?.error?.message
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignIn;
