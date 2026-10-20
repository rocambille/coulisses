import type { RouteObject } from "react-router";

import { playRoutes } from "../play";
import CalendarPage from "./CalendarPage";
import JoinPage from "./JoinPage";
import MembersPage from "./MembersPage";
import TroupeDashboardPage from "./TroupeDashboardPage";
import TroupeLayout from "./TroupeLayout";

export const troupeRoutes: RouteObject[] = [
  {
    path: "/troupes/:troupeId/join",
    element: <JoinPage />,
  },
  {
    path: "/troupes/:troupeId",
    element: <TroupeLayout />,
    children: [
      {
        index: true,
        element: <TroupeDashboardPage />,
      },
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      ...playRoutes,
    ],
  },
];
