import { Navigate, type RouteObject } from "react-router";
import CalendarPage from "./CalendarPage";
import CastingPage from "./CastingPage";
import MembersPage from "./MembersPage";
import PlayLayout from "./PlayLayout";
import RolesPage from "./RolesPage";
import ScenesPage from "./ScenesPage";

export const playRoutes: RouteObject[] = [
  {
    path: "/plays/:playId",
    element: <PlayLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="scenes" replace />,
      },
      {
        path: "scenes",
        element: <ScenesPage />,
      },
      {
        path: "casting",
        element: <CastingPage />,
      },
      {
        path: "roles",
        element: <RolesPage />,
      },
      {
        path: "members",
        element: <MembersPage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
    ],
  },
];
