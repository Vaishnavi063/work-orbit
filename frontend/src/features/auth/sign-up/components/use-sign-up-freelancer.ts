import { useMutation } from "react-query";
import apis from "../../apis";
import toast from "react-hot-toast";

const useSignUpClient = () => {
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerClient({ data }),
    onSuccess: ({ data }) => {
      toast.success("Register Client Success");
      console.log("RESIGTER CLIENT DATA => ", data);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpClient;
