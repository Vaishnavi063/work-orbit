import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  email: z
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;