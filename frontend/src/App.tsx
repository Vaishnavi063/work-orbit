import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./routes";
const App = () => {
  return (
    <div className="min-h-screen w-full">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
};

export default App;
