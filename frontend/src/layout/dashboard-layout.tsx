import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar, AblyConnectionIndicator } from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { ChatNotification } from "@/components/shared/chat-notification";
import { fetchUserChatRooms } from "@/store/slices/chat-slice";
import type { AppDispatch } from "@/store";

const Header = () => {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { authToken } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (authToken) {
      dispatch(fetchUserChatRooms({ authToken }));
    }
  }, [authToken, dispatch]);

  return (
    <header className="flex h-16 shrink-0 px-4 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b w-full print:hidden">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 size-8 cursor-pointer" />
        <div className="flex items-center justify-center space-x-2">
          <Avatar className="flex items-center justify-center size-6">
            <AvatarImage src={""} alt="profile" />
            <AvatarFallback className="bg-foreground text-card text-sm">
              {user?.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-foreground text-sm font-medium">{user?.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AblyConnectionIndicator />
        <ChatNotification />
        <Badge
          className={`inline-block rounded-md px-2.5 py-0.4 text-xs font-semibold tracking-wide
      ${
        user?.role === "ROLE_CLIENT"
          ? "bg-[#E0F2FE] text-[#0369A1] border border-[#0369A1]"
          : "bg-[#DCFCE7] text-[#15803D] border border-[#15803D]"
      }`}
        >
          {user?.role === "ROLE_CLIENT" ? "Client" : "Freelancer"}
        </Badge>
      </div>
    </header>
  );
};

const OutletComp = () => {
  return (
    <div className="p-4 w-full">
      <Outlet />
    </div>
  );
};

const DashboardLayout = () => {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/auth/sign-in" />;
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
