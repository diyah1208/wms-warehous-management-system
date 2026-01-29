import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase().trim();
  const isFinanceMarketing =
    role === "finance" || role === "marketing";

  if (
    isFinanceMarketing &&
    location.pathname === "/dashboard"
  ) {
    return <Navigate to="/spb" replace />;
  }
  return children;
}
