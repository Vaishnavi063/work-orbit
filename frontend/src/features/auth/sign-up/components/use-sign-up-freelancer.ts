import toast from "react-hot-toast";
import { useMutation } from "react-query";

import apis from "../../apis";

const useSignUpFreelancer = () => {
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerFreelancer({ data }),
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

export default useSignUpFreelancer;
