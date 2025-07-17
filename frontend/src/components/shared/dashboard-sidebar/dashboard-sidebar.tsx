import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import NavMain from "./nav-main";
import NavHeader from "./nav-header";
import NavSecondary from "./nav-secondary";

const DashboardSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <NavHeader />
      <Separator />
      <NavMain />
      <NavSecondary />
      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;
