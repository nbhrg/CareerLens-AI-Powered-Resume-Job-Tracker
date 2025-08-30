import React, { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";
import { authUtils } from "../utils/api";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const token = authUtils.getToken();
        const userData = authUtils.getUser();

        if (token && userData) {
            setUser(userData);
        }
        setLoading(false);
    }, []);

    const login = async (userData, token) => {
        try {
            authUtils.setAuth(userData, token);
            setUser(userData);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        authUtils.clearAuth();
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        authUtils.setAuth(newUserData, authUtils.getToken());
        setUser(newUserData);
    };

    const isCandidate = () => user?.role === "candidate";
    const isRecruiter = () => user?.role === "recruiter";

    const value = {
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
        isCandidate,
        isRecruiter,
        token: authUtils.getToken(),
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
