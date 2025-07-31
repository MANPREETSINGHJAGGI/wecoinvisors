// File: context/AuthProvider.tsx
"use client";

import { createContext, useEffect, useState, useContext } from "react";
import app from "@/lib/firebase"; // ✅ Import the initialized app
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// Initialize auth correctly
const auth = getAuth(app);

// Create Auth Context
const AuthContext = createContext<{ user: User | null }>({ user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
