import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // while auth is loading, do nothing
    if (loading) return;

    if (!user) {
      // preserve where the user was trying to go
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  if (loading) return null; // or a spinner

  // If user exists, render children; otherwise the effect redirected them
  return <>{user ? children : null}</>;
}
