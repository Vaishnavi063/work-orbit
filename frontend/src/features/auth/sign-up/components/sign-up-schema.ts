import { z } from "zod";

export const signUpFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(30, { message: "Full name must not be longer than 30 characters." }),

  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(50, { message: "Password must not be longer than 50 characters." }),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
