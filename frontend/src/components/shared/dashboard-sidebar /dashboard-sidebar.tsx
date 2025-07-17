import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import NavHeader from "./nav-header";
import { Separator } from "@/components/ui/separator";
import NavMain from "./nav-main";
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
