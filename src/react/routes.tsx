/*
  Purpose:
  Central UI routing entry point for the React application.
*/

import { type RouteObject, useLoaderData } from "react-router";

import AccountPage from "./components/auth/AccountPage";
import { MeProvider } from "./components/auth/MeContext";
import VerifyPage from "./components/auth/VerifyPage";
import { DataRefreshProvider } from "./components/DataRefreshContext";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
import Layout from "./components/Layout";

import { troupeRoutes } from "./components/troupe";

import "./index.css";

/* ************************************************************************ */
/* Routes definition                                                        */
/* ************************************************************************ */

const routes: RouteObject[] = [
  {
    Component: () => {
      const { me } = useLoaderData<{ me: User | null }>();

      return (
        <MeProvider initialUser={me}>
          <DataRefreshProvider>
            <Layout />
          </DataRefreshProvider>
        </MeProvider>
      );
    },
    errorElement: <ErrorPage />,
    /*
      Root loader:
      - Fetches the current user from the /api/users/me endpoint
      - Returns the user to the root component
    */
    loader: async () => {
      const response = await fetch("/api/users/me");

      const me: User | null = response.ok ? await response.json() : null;

      return { me };
    },
    /*
      Nested routes:
      - index route: Home page
      - feature routes: imported and spread from modules

      The pathless wrapper route acts as an error boundary:
      - Catches errors from all child routes (fetch failures, etc.)
      - Renders ErrorPage inside the Layout (NavBar stays visible)
      - No per-route errorElement needed
    */
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "account",
            element: <AccountPage />,
          },
          {
            path: "verify",
            element: <VerifyPage />,
          },
          ...troupeRoutes,
        ],
      },
    ],
  },
];

export default routes;
