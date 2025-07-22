import { NAV_LINKS } from "@/constants/nav-links";
import AuthButtons from "./auth-buttons";
import LogoLink from "./logo-link";
import NavLinks from "./nav-links";
import UserAvatar from "./user-avatar";
import { AblyConnectionIndicator } from "@/components";
import useAuth from "@/hooks/use-auth";

const SiteHeader = () => {
  const { isAuth } = useAuth();
  
  return (
    <header className="border-grid sticky z-10 top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-8 flex h-14 items-center mx-auto space-x-2 justify-between">
        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
          <LogoLink />
          <NavLinks links={NAV_LINKS} />
        </div>
        <div className="flex items-center justify-center space-x-2">
          {isAuth && <AblyConnectionIndicator />}
          <AuthButtons />
          <div className="hidden md:block">
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
