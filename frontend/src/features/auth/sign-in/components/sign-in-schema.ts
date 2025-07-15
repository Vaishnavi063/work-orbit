import { z } from "zod";

export const signInFormSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Please enter email address." }),

  password: z
    .string()
    .nonempty({ message: "Please enter password." }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;
