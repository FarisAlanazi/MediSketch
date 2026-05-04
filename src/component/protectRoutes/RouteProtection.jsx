import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../Loading";

function RouteProtection({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RouteProtection;
