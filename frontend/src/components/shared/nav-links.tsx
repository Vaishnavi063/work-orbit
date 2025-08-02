import useAuth from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { NavLinkType } from "@/types";
import { NavLink } from "react-router-dom";

interface NavLinksProps {
  links: NavLinkType[];
}
const NavLinks = ({ links }: NavLinksProps) => {
  const { isAuth } = useAuth();
  
  return (
    <div className="items-center justify-center space-x-4 hidden md:flex">
      {links.map((link) => {
        // Skip protected links if user is not authenticated
        if (link.isProtected && !isAuth) {
          return null;
        }

        if (link.action && !link.path) {
          return (
            <button
              key={link.id}
              onClick={link.action}
              className={cn(
                "hover:text-primary transition-all space-x-1 flex items-center text-muted-foreground justify-center"
              )}
            >
              <span className="text-sm">{link.title}</span>
            </button>
          );
        }
        
        return (
          <NavLink
            key={link.id}
            to={link.path!}
            className={({ isActive }) =>
              cn(
                "hover:text-primary transition-all space-x-1 flex items-center text-muted-foreground justify-center",
                isActive && "text-primary font-semibold"
              )
            }
          >
            <span className="text-sm">{link.title}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default NavLinks;
