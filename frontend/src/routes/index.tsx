import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";

import SignInPage from "@/features/auth/sign-in";
import SignUpPage from "@/features/auth/sign-up";
import ForgotPasswordPage from "@/features/auth/forgot-password";
import ResetPasswordPage from "@/features/auth/reset-password";
import AuthLayout from "@/layout/auth-layout";
import DashboardLayout from "@/layout/dashboard-layout";
import PageNotFound from "@/features/not-found";

import HomePage from "../features/home";
import AppLayout from "../layout/app-layout";
import Profile from "@/features/profile";
import ClientProjectsDashboard from "@/features/projects";

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
        <Route path="projects" element={<ClientProjectsDashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Route>
    )
);

export default router;
