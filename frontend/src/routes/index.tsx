import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import HomePage from "../features/home";
import AppLayout from "../layout/app-layout";
import SignInPage from "@/features/auth/sign-in";
import SignUpPage from "@/features/auth/sign-up";
import AuthLayout from "@/layout/auth-layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="auth" element={<AuthLayout />}>
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Route>
  )
);

export default router;
