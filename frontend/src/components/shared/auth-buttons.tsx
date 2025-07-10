import { Button } from "../ui/button";

const AuthButtons = () => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        size="sm"
        variant="outline"
        // onClick={() => redirect("/auth/sign-in")}
      >
        Sign in
      </Button>
      <Button
        size="sm"
        // onClick={() => redirect("/auth/sign-up")}
      >
        Sign up
      </Button>
    </div>
  );
};

export default AuthButtons;
