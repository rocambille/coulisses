/*
  Purpose:
  Provide a minimal mechanism to trigger re-renders after data mutations.

  Why this exists:
  - The cache layer stores Promises, not reactive state
  - After invalidateCache(), React does not know data has changed
  - This context bridges cache invalidation with React re-rendering

  Usage:
  - Wrap the app with <RefreshProvider>
  - Use useRefresh() to access { tick, refresh }
  - Use useMutate() for the common mutate → invalidate → refresh flow

  Design notes:
  - tick is an opaque counter, not meaningful data
  - Consumers should depend on tick to re-suspend after invalidation
  - No external dependencies
*/

import { createContext, type ReactNode, useContext, useState } from "react";

import { invalidateCache, mutate } from "./utils";

/* ************************************************************************ */
/* Context                                                                  */
/* ************************************************************************ */

type RefreshContextType = {
  tick: number;
  refresh: () => void;
};

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

/* ************************************************************************ */
/* Provider                                                                 */
/* ************************************************************************ */

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  return (
    <RefreshContext.Provider value={{ tick, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

/* ************************************************************************ */
/* Hooks                                                                    */
/* ************************************************************************ */

/*
  useRefresh():
  - Returns { tick, refresh }
  - tick: include in dependency arrays to re-suspend after mutations
  - refresh: call after invalidateCache() to trigger re-render
*/
export function useRefresh() {
  const context = useContext(RefreshContext);

  if (context === undefined) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }

  return context;
}

/*
  useMutate():
  - Returns a function that performs a mutation and refreshes the UI
  - Combines mutate() + invalidateCache() + refresh()
  - Keeps components declarative

  Usage:
    const mutate = useMutate();
    await mutate("/api/items/1", "put", { title: "New" }, ["/api/items"]);
*/
export function useMutate() {
  const { refresh } = useRefresh();

  return async (
    url: string,
    method: "post" | "put" | "delete",
    body?: unknown,
    invalidatePaths: string[] = [],
  ) => {
    const response = await mutate(url, method, body);

    if (response.ok) {
      for (const path of invalidatePaths) {
        invalidateCache(path);
      }
      refresh();
    }

    return response;
  };
}
