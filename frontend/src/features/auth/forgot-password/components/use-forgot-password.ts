import { useMutation } from "react-query";

import apis from "../../apis";
import { toast } from "sonner";
import type { ApiError } from "@/types";

const useForgotPassword = () => {
  const { mutate, isLoading } = useMutation({
    mutationFn: ({ data }: { data: { email: string } }) =>
      apis.forgotPassword({ data }),
    onSuccess: () => {
      toast.success("Password reset email sent", {
        description: "Check your email for password reset instructions"
      });
    },
    onError: (err: ApiError) => {
      toast.error("Something went wrong", {
        description: err?.response?.data?.error?.message || "Failed to send password reset email"
      });
    },
    retry: false,
  });

  return { isLoading, mutate };
};

export default useForgotPassword;