import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const useSignUpFreelancer = () => {
  const navigate = useNavigate();
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerFreelancer({ data }),
    onSuccess: () => {
      toast.success("Freelancer registered successfully");
       navigate("/auth/sign-in")
    },
    onError: (err: any) => {
      toast.error("Something went wrong",{
        description: err?.response?.data?.error?.password
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpFreelancer;
