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

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
    
            const response = await fetch(`${API_URL}/api/user/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });
    
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Handle authentication failure
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/api/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });
    
            if (response.ok) {
                const data = await response.json();
                // Store the token
                localStorage.setItem("token", data.token);
                // Fetch user info
                await fetchUser();
                return true;
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
        return false;
    };

    const register = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/register/`, {
                method: "POST",
                body: formData,
            });
            
            // Log response details for debugging
            console.log("Status:", response.status);
            const responseData = await response.clone().json().catch(e => "Could not parse JSON");
            console.log("Response data:", responseData);
            
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
