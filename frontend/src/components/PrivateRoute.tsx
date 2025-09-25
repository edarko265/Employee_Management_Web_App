import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;

  if (!token || !parsedUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
