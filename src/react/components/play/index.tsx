import type { RouteObject } from "react-router";

import CastingPage from "./CastingPage";
import PlayLayout from "./PlayLayout";
import RolesPage from "./RolesPage";
import ScenesPage from "./ScenesPage";

export const playRoutes: RouteObject[] = [
  {
    path: "plays/:playId",
    element: <PlayLayout />,
    children: [
      {
        path: "scenes",
        element: <ScenesPage />,
      },
      {
        path: "roles",
        element: <RolesPage />,
      },
      {
        path: "casting",
        element: <CastingPage />,
      },
    ],
  },
];
