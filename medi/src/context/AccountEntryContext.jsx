import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function AccountEntryContext() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.user_type === "doctor") {
    return <Navigate to="/doctor/profile" replace />;
  }

  return <Navigate to="/account/profile" replace />;
}

export default AccountEntryContext;
