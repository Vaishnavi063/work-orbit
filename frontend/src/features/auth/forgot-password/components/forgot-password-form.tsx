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

import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "./forgot-password-schema";
import useForgotPassword from "./use-forgot-password";

const ForgotPasswordForm = () => {
  const { isLoading, mutate } = useForgotPassword();
  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutate({ data });
  };

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@workorbit.com"
                  className="focus-visible:ring-1 border-black"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="cursor-pointer" type="submit" disabled={isLoading}>
          Send Reset Link
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

export default ForgotPasswordForm;