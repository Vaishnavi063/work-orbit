import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import apis from "../../apis";
import { toast } from "sonner";
import type { ApiError } from "@/types";

const useResetPassword = () => {
  const navigate = useNavigate();
  
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { token: string; password: string } }) =>
      apis.resetPassword({ data }),
    onSuccess: ({ data: response }) => {
      toast.success("Password reset successful", {
        description: "You can now sign in with your new password"
      });
      console.log("RESET PASSWORD DATA -> ", response);
      // Redirect to sign-in page after successful reset
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 2000);
    },
    onError: (err: ApiError) => {
      toast.error("Password reset failed", {
        description: err?.response?.data?.error?.message || "Invalid or expired token"
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useResetPassword;