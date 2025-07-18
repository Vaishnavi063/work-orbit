import { z } from "zod";

export const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .nonempty({ message: "Please enter password." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(20, { message: "Password must be at most 20 characters long." }),
  confirmPassword: z
    .string()
    .nonempty({ message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;