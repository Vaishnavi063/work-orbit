import { useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import useAuth from "@/hooks/use-auth";

const AuthButtons = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const redirect = (url: string) => navigate(url);

  if (isAuth) return null;

  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        className="cursor-pointer"
        size="sm"
        variant="outline"
        onClick={() => redirect("/auth/sign-in")}
      >
        Sign in
      </Button>
      <Button
        className="cursor-pointer"
        size="sm"
        onClick={() => redirect("/auth/sign-up")}
      >
        Sign up
      </Button>
    </div>
  );
};

export default AuthButtons;
