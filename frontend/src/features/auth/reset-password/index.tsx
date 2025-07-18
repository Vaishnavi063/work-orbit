import { Link, useSearchParams } from "react-router-dom";

import { SignInIcon } from "@/components";

import ResetPasswordForm from "./components/reset-password-form";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="container mx-auto pb-8">
          <div className="container relative flex-col items-center justify-center p-0 md:grid lg:max-w-none lg:grid-cols-2">
            <div className="relative hidden h-full flex-col rounded-l-2xl border-r lg:flex lg:p-5">
              <SignInIcon />
            </div>
            <div className="lg:p-5">
              <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Invalid Reset Link
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    The password reset link is invalid or has expired.
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-foreground/60 transition-all hover:text-foreground md:text-sm"
                  >
                    Request a new reset link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="container mx-auto pb-8">
        <div className="container relative flex-col items-center justify-center p-0 md:grid lg:max-w-none lg:grid-cols-2">
          <div className="relative hidden h-full flex-col rounded-l-2xl border-r lg:flex lg:p-5">
            <SignInIcon />
          </div>
          <div className="lg:p-5">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Reset Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below
                </p>
              </div>
              <ResetPasswordForm token={token} />
              <div className="flex items-center justify-center">
                <Link
                  to="/auth/sign-in"
                  className="text-xs text-foreground/60 transition-all hover:text-foreground md:text-sm"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;