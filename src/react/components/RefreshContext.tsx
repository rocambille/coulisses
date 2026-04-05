import { createContext, type ReactNode, useContext, useState } from "react";

type RefreshContextType = {
  tick: number;
  refresh: () => void;
};

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  return (
    <RefreshContext.Provider value={{ tick, refresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);

  if (context === undefined) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }

  return context;
}
