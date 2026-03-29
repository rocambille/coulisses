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
import LoginPage from "./components/auth/LoginPage";
import VerifyPage from "./components/auth/VerifyPage";
import DashboardPage from "./components/DashboardPage";
import { itemRoutes } from "./components/item/index";
import Layout from "./components/Layout";

import "./index.css";

/* ************************************************************************ */
/* Routes definition                                                        */
/* ************************************************************************ */

const routes: RouteObject[] = [
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "verify",
        element: <VerifyPage />,
      },
      ...itemRoutes,
    ],
  },
];

export default routes;
