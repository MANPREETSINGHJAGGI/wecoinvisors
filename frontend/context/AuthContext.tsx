"use client";

import { createContext, useContext, ReactNode } from "react";

// 🚀 Fake Auth Context — always "logged in"
interface AuthContextType {
  user: { name: string } | null;
  loading: boolean;
  logout: () => void;
}

// Always provide a fake user object
const AuthContext = createContext<AuthContextType>({
  user: { name: "Guest User" },
  loading: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider
      value={{
        user: { name: "Guest User" },
        loading: false,
        logout: () => {
          console.log("Logout disabled in guest mode.");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
