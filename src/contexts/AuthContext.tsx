import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface User {
    username: string;
    role: string;
    lastLogin: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "acme_saico_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const stored = localStorage.getItem(AUTH_KEY);
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch (e) {
                    localStorage.removeItem(AUTH_KEY);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = useCallback(async (username: string) => {
        setIsLoading(true);
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const userData: User = {
            username,
            role: "Engineering Lead",
            lastLogin: Date.now()
        };

        setUser(userData);
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        setIsLoading(false);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!user,
            user,
            login,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
