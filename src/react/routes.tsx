/*
  Purpose:
  Central UI routing entry point for the React application.

  Responsibilities:
  - Define the root layout of the application
  - Compose feature modules (e.g. items)

  Design notes:
  - Routes are declared explicitly (no automatic discovery)
  - Feature modules expose their own route fragments

  This file is shared by:
  - entry-client.tsx (client-side routing & hydration)
  - entry-server.tsx (server-side rendering & data loading)
*/

import { type RouteObject, useLoaderData } from "react-router";

import LogoutForm from "./components/auth/LogoutForm";
import VerifyPage from "./components/auth/VerifyPage";
import ErrorPage from "./components/ErrorPage";
import Layout from "./components/Layout";
import { playRoutes } from "./components/play/index";

import "./index.css";
import { AuthProvider } from "./components/auth/AuthContext";
import DashboardPage from "./components/DashboardPage";
import { DataRefreshProvider } from "./components/DataRefreshContext";

/* ************************************************************************ */
/* Routes definition                                                        */
/* ************************************************************************ */

const routes: RouteObject[] = [
  {
    /*
      Root component:
      Wraps all pages with the global <Layout> and providers
    */
    Component: () => {
      const { me } = useLoaderData<{ me: User | null }>();

      return (
        <AuthProvider initialUser={me}>
          <DataRefreshProvider>
            <Layout />
          </DataRefreshProvider>
        </AuthProvider>
      );
    },
    /*
      Error element: provides an <ErrorPage> for 400s and 500s
    */
    errorElement: <ErrorPage />,
    /*
      Root loader:
      - Fetches the current user from the /api/me endpoint
      - Returns the user to the root component

      This loader runs on both server and client, so we need to use fetch
      with the appropriate headers:
      - cookie forwarding for server (req.headers.get("cookie") ?? "")
      - attached cookies for client (already attached: invisible here)
    */
    loader: async ({ request }) => {
      // On the server: forward cookies explicitly (Node has no cookie jar)
      // On the client: browser attaches cookies automatically, this is a no-op
      const response = await fetch("/api/me", {
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      const me: User | null = response.ok ? await response.json() : null;

      return { me };
    },
    /*
      Nested routes:
      - index route: Home page
      - feature routes: imported and spread from modules
    */
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
