import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    useEffect(() => {
        const stored = localStorage.getItem("auth");
        if (stored) {
            const { user, token } = JSON.parse(stored);
            setUser(user);
            setToken(token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    }, []);
    const login = (user, token) => {
        setUser(user);
        setToken(token);
        localStorage.setItem("auth", JSON.stringify({ user, token }));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth");
        delete api.defaults.headers.common["Authorization"];
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, login, logout }, children: children }));
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
