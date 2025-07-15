import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const AuthButtons = () => {
  const navigate = useNavigate();
  const redirect = (url: string) => navigate(url);
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
