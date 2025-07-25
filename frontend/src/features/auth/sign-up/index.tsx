import { Link } from "react-router-dom";

import { SignUpIcon } from "@/components";

import SignUpForm from "./components/sign-up-form";

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="container mx-auto pb-8">
        <div className="container relative flex-col items-center justify-center p-0 md:grid lg:max-w-none lg:grid-cols-2">
          <div className="relative hidden h-full flex-col rounded-l-2xl border-r lg:flex lg:p-5">
            <SignUpIcon />
          </div>
          <div className="lg:p-5">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your information below to create your account
                </p>
              </div>
              <SignUpForm />
              <div className="flex items-center justify-center">
                <Link
                  to="/auth/sign-in"
                  className="text-xs text-foreground/60 transition-all hover:text-foreground md:text-sm"
                >
                  Already have an acount?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
