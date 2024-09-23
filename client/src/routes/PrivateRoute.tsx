// ProtectedRoute.js
import { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: ReactNode
}

const PrivateRoute = ({ children }: Props) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return  isAuthenticated() ? (
    <>{children}</>
  ) : (
    <Navigate
      replace={true}
      to="/signin"
      state={{ from: `${location.pathname}${location.search}`}}
    />
  )
}

export default PrivateRoute;