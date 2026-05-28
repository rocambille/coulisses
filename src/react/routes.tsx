/*
  Purpose:
  Central UI routing entry point for the React application.
*/

import { type RouteObject, useLoaderData } from "react-router";
import AccountPage from "./components/auth/AccountPage";
import { AuthProvider } from "./components/auth/AuthContext";
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
        <AuthProvider initialUser={me}>
          <DataRefreshProvider>
            <Layout />
          </DataRefreshProvider>
        </AuthProvider>
      );
    },
    errorElement: <ErrorPage />,
    loader: async () => {
      const response = await fetch("/api/users/me");
      const me: User | null = response.ok ? await response.json() : null;

      return { me };
    },
    children: [
      {
        index: true,
        element: <Home />, // Liste des troupes
      },
      {
        path: "me",
        element: <AccountPage />,
      },
      {
        path: "verify",
        element: <VerifyPage />,
      },
      ...troupeRoutes,
    ],
  },
];

export default routes;
