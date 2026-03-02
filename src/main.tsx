import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import "../i18n";
import App from "./App";
import Account from "./pages/Account";
import Home from "./pages/Account/Home";
import Profile from "./pages/Account/Profile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/Login/ForgotPassword";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Consent from "./pages/Login/Consent";
import SelectOrganization from "./pages/Login/SelectOrganization";
import { ThunderSDK } from "thunder-sdk";

ThunderSDK.init({
  axiosConfig: {
    baseURL: import.meta.env.VITE_API_ORIGIN,
  },
});

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
            {
              path: "/account/profile",
              element: <Profile />,
            },
          ],
        },
        {
          path: "/select-organization",
          element: <SelectOrganization />,
        },
        {
          path: "/consent",
          element: <Consent />,
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
          path: "/forgot-password",
          element: <ForgotPassword />,
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
