import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

const ModeToggle = () => {
  return (
    <Button
      className="flex flex-shrink-0 items-center justify-center size-8 px-0"
      variant="outline"
    >
      <Sun size={15} className="hidden text-primary [html.dark_&]:block" />
      <Moon size={15} className="block text-black [html.dark_&]:hidden" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ModeToggle;
