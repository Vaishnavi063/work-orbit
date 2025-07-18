import { RouterProvider } from "react-router-dom";

import router from "./routes";
import { ThemeProvider } from "./components";
import { Toaster } from "./components/ui/sonner";

const App = () => {
  return (
    <div className="min-h-screen w-full">
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster
          expand={true}
          position="bottom-right"
          richColors
          theme="light"
          toastOptions={{
            classNames: {
              toast: "bg-white text-gray-900 shadow-lg border border-gray-200",
              success: "bg-green-100 text-green-800 border border-green-300",
              error: "bg-red-100 text-red-800 border border-red-300",
              info: "bg-blue-100 text-blue-800 border border-blue-300",
              warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
            },
          }}
        />
      </ThemeProvider>
    </div>
  );
};

export default App;
