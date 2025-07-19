import { toast } from "sonner";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";

import { setAuth } from "@/store/slices/auth-slice";

import apis from "../../apis";

const useSignUpFreelancer = () => {
  const dispatch = useDispatch();
  const { isLoading, mutate } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: { email: string; name: string; password: string };
    }) => apis.registerFreelancer({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Freelancer registered successfully");
      dispatch(
        setAuth({
          user: response?.data,
          authToken: response?.data?.token,
        })
      );
    },
    onError: (err: any) => {
      toast.error("Something went wrong", {
        description: err?.response?.data?.error?.password,
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useSignUpFreelancer;
