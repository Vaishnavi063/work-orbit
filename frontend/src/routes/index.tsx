import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import HomePage from "../features/home";
import AppLayout from "../layout/app-layout";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Route>
  )
);

export default router;
