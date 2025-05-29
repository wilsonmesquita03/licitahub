"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

export interface SessionAuthenticated {
  user: {
    id: string;
    name: string | null;
    email: string;
    picture: string | null;
    followedTenders: { id: string }[];
  };
  status: "authenticated";
  logout?: () => Promise<void>;
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
  const [sessionState, setSessionState] = useState<Session>(session);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
      .then(() => setSessionState({ status: "unauthenticated", user: null }))
      .catch(() => setSessionState({ status: "unauthenticated", user: null }));
  };

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => setSessionState({ ...data, logout }))
      .catch(() => setSessionState({ status: "unauthenticated", user: null }));
  }, []);

  return (
    <SessionContext.Provider value={sessionState}>
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
