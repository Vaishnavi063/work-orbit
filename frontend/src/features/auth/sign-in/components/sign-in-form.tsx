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

import { signInFormSchema, type SignInFormValues } from "./sign-in-schema";
import useSignIn from "./use-sign-in";

const SignInForm = () => {
  const { isLoading, mutate } = useSignIn();
  const onSubmit = (data: SignInFormValues) => {
    mutate({ data });
  };

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
          Login An Account
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

export default SignInForm;
