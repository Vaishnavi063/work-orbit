import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import Profile from "@/features/profile";
import AuthLayout from "@/layout/auth-layout";
import PageNotFound from "@/features/not-found";
import SignInPage from "@/features/auth/sign-in";
import SignUpPage from "@/features/auth/sign-up";
import BrowseProjects from "@/features/freelancer";
import DashboardLayout from "@/layout/dashboard-layout";
import ResetPasswordPage from "@/features/auth/reset-password";
import ForgotPasswordPage from "@/features/auth/forgot-password";

import HomePage from "../features/home";
import AppLayout from "../layout/app-layout";
import ProjectDetails from "@/features/freelancer/components/project-details";
import FreelancerBids from "@/features/freelancer/components/freelancer-bids";
import ClientProjectsDashboard from "@/features/projects";
import ProfileUpdate from "@/features/profile/update";
import ContractsFeature from "@/features/contracts";
import RevenueDetail from "@/features/wallet/freelancer";
import { ClientWallet } from "@/features/wallet/client";
import MyProjects from "@/features/client";
import FreelancerProfileRoutePage from "@/features/freelancer/components/freelancer-profile-route-page";
import ChatPage from "@/features/chat";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="auth" element={<AuthLayout />}>
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route path="profile" element={<Profile />} />
        <Route path="profile/update" element={<ProfileUpdate />} />
        <Route path="profile/:freelancerId" element={<FreelancerProfileRoutePage />} />
        <Route path="projects/*" element={<ClientProjectsDashboard />} />
        <Route path="contracts/*" element={<ContractsFeature />} />
        <Route path="browse-projects" element={<BrowseProjects />} />
        <Route path="bids" element={<FreelancerBids />} />
        <Route path="browse-projects/:id" element={<ProjectDetails />} />
        <Route path="revenue" element={<RevenueDetail />} />
        <Route path="wallet" element={<ClientWallet />} />
        <Route path="my-projects" element={<MyProjects />} />
        <Route path="chats/*" element={<ChatPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Route>
  )
);

export default router;
