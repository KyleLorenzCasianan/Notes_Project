import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const AuthContext = createContext(null);

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        request("/auth/me")
            .then(({ user: currentUser }) => setUser(currentUser))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login: async (credentials) => {
            const data = await request("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials)
            });
            setUser(data.user);
        },
        register: async (details) => {
            const data = await request("/auth/register", {
                method: "POST",
                body: JSON.stringify(details)
            });
            setUser(data.user);
        },
        logout: async () => {
            await request("/auth/logout", { method: "POST" });
            setUser(null);
        }
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};
