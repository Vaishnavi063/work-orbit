import { useForm } from "react-hook-form";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPasswordFormSchema, type ResetPasswordFormValues } from "./reset-password-schema";
import useResetPassword from "./use-reset-password";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const { isLoading, mutate } = useResetPassword();
  const onSubmit = (data: ResetPasswordFormValues) => {
    mutate({ 
      data: { 
        token, 
        password: data.password 
      } 
    });
  };

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-6 md:px-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  className="focus-visible:ring-1 border-black"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  className="focus-visible:ring-1 border-black"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="cursor-pointer" type="submit" disabled={isLoading}>
          Reset Password
          {isLoading ? (
            <LoaderCircle className="ml-2 size-4 animate-spin" />
          ) : (
            <ArrowRight className="ml-2 size-4" />
          )}{" "}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;