import { Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardSidebar, ModeToggle } from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  // const { user } = useAuth();
  return (
    <header className="flex h-16 shrink-0 px-4 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b w-full print:hidden">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-8 cursor-pointer" />
        <div className="flex items-center justify-center space-x-2">
          <Avatar className="flex items-center justify-center size-6">
            <AvatarImage src={""} alt="profile" />
            <AvatarFallback className="bg-foreground text-card text-sm">
              {/* {user?.fullName[0].toUpperCase()} */}K
            </AvatarFallback>
          </Avatar>
          <h1 className="text-foreground text-sm font-medium">
            {/* {user?.fullName} */} Krish
          </h1>
        </div>
      </div>
      <ModeToggle />
    </header>
  );
};

const OutletComp = () => {
  const { open, isMobile } = useSidebar();
  return (
    <div
      className={cn(
        "p-4",
        open ? "w-[calc(100vw_-250px)]" : "w-[calc(100vw_-50px)]",
        isMobile && "w-full"
      )}
    >
      <Outlet />
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="w-full">
        <SidebarInset>
          <Header />
          <OutletComp />
        </SidebarInset>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
