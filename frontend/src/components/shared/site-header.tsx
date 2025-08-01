import { useState } from "react";
import { NAV_LINKS } from "@/constants/nav-links";
import type { NavLinkType } from "@/types";
import useAuth from "@/hooks/use-auth";
import AuthButtons from "./auth-buttons";
import LogoLink from "./logo-link";
import NavLinks from "./nav-links";
import UserAvatar from "./user-avatar";
import { ContactFormModal } from "./contact-form-modal";

const SiteHeader = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { user } = useAuth();

  // Create navigation links with contact form action
  const navLinksWithActions: NavLinkType[] = NAV_LINKS.map((link) => {
    if (link.title === "Contact Us") {
      return {
        ...link,
        action: () => setIsContactModalOpen(true),
      };
    }
    return link;
  });

  return (
    <>
      <header className="border-grid sticky z-10 top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 sm:px-8 flex h-14 items-center mx-auto space-x-2 justify-between">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <LogoLink />
            <NavLinks links={navLinksWithActions} />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <AuthButtons />
            <div className="hidden md:block">
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userEmail={user?.email}
      />
    </>
  );
};

export default SiteHeader;
