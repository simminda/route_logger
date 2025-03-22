import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/user/", {
                headers: { Authorization: `Token ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
                localStorage.setItem("token", data.token);
                fetchUser();
                return true;
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
        return false;
    };

    const register = async (formData) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                body: formData, // FormData instead of JSON
            });
    
            return response.ok;
        } catch (error) {
            console.error("Registration failed:", error);
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
