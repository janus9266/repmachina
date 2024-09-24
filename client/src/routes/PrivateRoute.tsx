// ProtectedRoute.js
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: ReactNode
}

const PrivateRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/signin" />;
  }

  return (
    <>{children}</>
  );
}

export default PrivateRoute;