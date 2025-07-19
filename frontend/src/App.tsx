import { RouterProvider } from "react-router-dom";

import router from "./routes";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";

const App = () => {
  return (
    <div className="min-h-screen w-full">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
          <Toaster
            expand={true}
            position="bottom-right"
            richColors
            theme="light"
            toastOptions={{
              classNames: {
                toast:
                  "bg-white text-gray-900 shadow-lg border border-gray-200",
                success: "bg-green-100 text-green-800 border border-green-300",
                error: "bg-red-100 text-red-800 border border-red-300",
                info: "bg-blue-100 text-blue-800 border border-blue-300",
                warning:
                  "bg-yellow-100 text-yellow-800 border border-yellow-300",
              },
            }}
          />
        </PersistGate>
      </Provider>
    </div>
  );
};

export default App;
