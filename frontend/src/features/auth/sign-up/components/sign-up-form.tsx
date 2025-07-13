import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";

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

import { signUpFormSchema, type SignUpFormValues } from "./sign-up-schema";

const SignUpForm = () => {
  const [userType, setUserType] = useState<"freelancer" | "client">(
    "freelancer"
  );

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
  });

  const onSubmit = (data: SignUpFormValues) => {
    console.log("DATA =>", { ...data, userType });
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="p-1 rounded-sm flex w-full border border-gray-400 shadow-sm">
          <button
            type="button"
            onClick={() => setUserType("freelancer")}
            className={`flex-1 px-4 py-2 cursor-pointer rounded-sm text-sm font-medium transition-all duration-200 ${
              userType === "freelancer"
                ? "bg-primary text-primary-foreground shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            💼 &nbsp; Freelancer
          </button>
          <button
            type="button"
            onClick={() => setUserType("client")}
            className={`flex-1 px-4 cursor-pointer py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
              userType === "client"
                ? "bg-primary text-white shadow"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            👤 &nbsp; Client
          </button>
        </div>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col space-y-6 md:px-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="jon doe"
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
                    placeholder="Enter your password"
                    className="focus-visible:ring-1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            Create An Account
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
