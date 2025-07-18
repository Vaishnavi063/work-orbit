import { Outlet } from "react-router-dom";

import { SiteFooter, SiteHeader } from "@/components";

const AppLayout = () => {
  return (
    <div
      className="
      absolute inset-0 h-full w-full 
      bg-white dark:bg-gray-900
      bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]
      dark:bg-[linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)]
      bg-[size:6rem_4rem]
    "
    >
      <div
        className="
        absolute bottom-0 left-0 right-0 top-0 
        bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]
        dark:bg-[radial-gradient(circle_500px_at_50%_200px,#1e293b,transparent)]
      "
      >
        <div className="border-grid flex flex-1 flex-col">
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-screen">
            <Outlet />
          </div>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
