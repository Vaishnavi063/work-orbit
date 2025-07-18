import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";

const useSignUpClient = () => {
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerClient({ data }),
    onSuccess: ({ data }) => {
      toast.success("Register Freelancer Success");
      console.log("RESIGTER FREELANCER DATA => ", data);
    },
    onError: (err:any) => {
      toast.error("Something went wrong",{
        description: err?.response?.data?.error?.message
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpClient;
