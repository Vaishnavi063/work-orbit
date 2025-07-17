import { NavLink } from "react-router-dom";

import { siteConfigs } from "@/apis";

import Logo from "./logo";

const LogoLink = () => {
  return (
    <NavLink
      to="/"
      className="flex items-center justify-center space-x-2 sm:space-x-4"
    >
      <Logo />
      <div className="grid flex-1 text-left sm:text-lg leading-tight">
        <span className="truncate font-semibold text-foreground">
          {siteConfigs.name.toUpperCase()}
        </span>
      </div>
    </NavLink>
  );
};

export default LogoLink;
