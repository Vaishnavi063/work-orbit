import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";

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
    onError: (err: any) => {
      toast.error("Something went wrong",{
        description: err?.response?.data?.error?.message
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpFreelancer;
