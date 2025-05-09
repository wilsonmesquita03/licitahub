"use client";

import { createContext, useContext, ReactNode } from "react";

export interface SessionAuthenticated {
  user: {
    id: string;
    name: string | null;
    email: string;
    followedTenders: { id: string }[];
  };
  status: "authenticated";
}

export interface SessionUnauthenticated {
  user: null;
  status: "unauthenticated";
}

export interface SessionLoading {
  user: null;
  status: "loading";
}

// Aqui está o tipo unificado
export type Session =
  | SessionAuthenticated
  | SessionUnauthenticated
  | SessionLoading;

interface SessionProviderProps {
  session: Session;
  children: ReactNode;
}

const SessionContext = createContext<Session>({
  user: null,
  status: "loading",
});

export const SessionProvider = ({
  session,
  children,
}: SessionProviderProps) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession deve ser usado dentro de um SessionProvider");
  }
  return context;
};
