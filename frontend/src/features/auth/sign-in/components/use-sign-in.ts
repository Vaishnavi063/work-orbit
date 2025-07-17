import { useMutation } from "react-query";
import apis from "../../apis";
import toast from "react-hot-toast";
const useSignIn = () => {
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      apis.login({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Logging Success")
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
