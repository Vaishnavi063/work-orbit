import { useMutation } from "react-query";
import apis from "../../apis";
import toast from "react-hot-toast";

const useSignUpClient = () => {
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerFreelancer({ data }),
    onSuccess: ({ data }) => {
      toast.success("Register Freelancer Success");
      console.log("RESIGTER FREELANCER DATA => ", data);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpClient;
