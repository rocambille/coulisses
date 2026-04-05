/*
  Purpose:
  Central UI routing entry point for the React application.

  Responsibilities:
  - Define the root layout of the application
  - Compose feature modules and pages

  This file is shared by:
  - entry-client.tsx (client-side routing & hydration)
  - entry-server.tsx (server-side rendering & data loading)
*/

import { Outlet, type RouteObject } from "react-router";
import { AuthProvider } from "./components/auth/AuthContext";
import LogoutForm from "./components/auth/LogoutForm";
import VerifyPage from "./components/auth/VerifyPage";
import DashboardPage from "./components/DashboardPage";
import Layout from "./components/Layout";
import { playRoutes } from "./components/play/index";
import { RefreshProvider } from "./components/RefreshContext";

import "./index.css";

/* ************************************************************************ */
/* Routes definition                                                        */
/* ************************************************************************ */

const routes: RouteObject[] = [
  {
    element: (
      <AuthProvider>
        <RefreshProvider>
          <Layout>
            <Outlet />
          </Layout>
        </RefreshProvider>
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "logout",
        element: <LogoutForm />,
      },
      {
        path: "verify",
        element: <VerifyPage />,
      },
      ...playRoutes,
    ],
  },
];

export default routes;
