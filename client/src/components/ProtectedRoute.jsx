import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to appropriate login page based on the attempted route
        const redirectTo = location.pathname.includes("/recruiter")
            ? "/recruiter/login"
            : "/candidate/login";
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard if user has wrong role
        const redirectTo =
            user.role === "recruiter"
                ? "/recruiter/dashboard"
                : "/candidate/dashboard";
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;
