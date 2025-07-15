import { useMutation } from "react-query";
import apis from "../../apis";
import { toast } from "sonner";
const useSignIn = () => {
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      apis.login({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Login success");
      console.log("LOGIN DATA -> ", response);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignIn;
