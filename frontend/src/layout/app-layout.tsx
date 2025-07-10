import { Outlet } from "react-router-dom";
import SiteHeader from "../components/shared/site-header";
import SiteFooter from "@/components/shared/site-footer";

const AppLayout = () => {
  return (
    <div className="border-grid flex flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col min-h-screen">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
};

export default AppLayout;
