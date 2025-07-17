import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import router from "./routes";
import { ThemeProvider } from "./components";

const App = () => {
  return (
    <div className="min-h-screen w-full">
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </div>
  );
};

export default App;
