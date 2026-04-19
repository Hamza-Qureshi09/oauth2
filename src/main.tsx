import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import "../i18n";
import App from "./App";
import Account from "./pages/Account";
import Home from "./pages/Account/Home";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/Login/ResetPassword";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Consent from "./pages/Login/Consent";
import { ThunderSDK } from "thunder-sdk";
import { toast } from "sonner";
import { apiOrigin } from "./lib/api";
import { Invite } from "./pages/Account/Members/Invite";

ThunderSDK.init({
  logs: true,
  axiosConfig: {
    baseURL: apiOrigin,
    withCredentials: true,
  },
});

ThunderSDK._axios?.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error(error.message || "An error occurred");
    return Promise.reject(error);
  },
);

const router = createBrowserRouter(
  [
    {
      path: "",
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate to={"/account" + window.location.search} />,
        },
        {
          path: "/account",
          element: <Account />,
          children: [
            {
              index: true,
              element: <Home />,
            },
            // {
            //   path: "/:accountId",
            //   element: <Members />,
            // },
          ],
        },
        {
          path: "/consent",
          element: <Consent />,
        },
        {
          path: "/invite/:userId",
          element: <Invite />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/change-password",
          element: <ChangePassword />,
        },
        {
          path: "/reset-password",
          element: <ResetPassword />,
        },
        {
          path: "/signup",
          element: <Signup />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
