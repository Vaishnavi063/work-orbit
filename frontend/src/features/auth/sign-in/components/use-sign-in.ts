import { useMutation } from "react-query";
import { useDispatch } from "react-redux";

import apis from "../../apis";
import { toast } from "sonner";
import { setAuth } from "@/store/slices/auth-slice";

const useSignIn = () => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      apis.login({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Logged in successfully")
       dispatch(
        setAuth({
          user: response?.data,
          authToken: response?.data?.token
        })
       )
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
