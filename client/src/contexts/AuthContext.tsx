import React, { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../types";

interface AuthContextProps {
  user: User | null
  login: (userData: User) => void,
  logout: () => void,
  isAuthenticated: () => boolean,
}

const defaultAuthContext: AuthContextProps = {
  user: null,
  login: (userData: User) => {},
  logout: () => {},
  isAuthenticated: () => false,
}

const AuthContext = createContext(defaultAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface Props {
  children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}