import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    useAuthStore.getState().setRedirect(location.pathname + location.search);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
