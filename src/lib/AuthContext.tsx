import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    User,
    getCurrentUser,
    getGitHubAuthUrl,
    getGoogleAuthUrl,
    logout as apiLogout,
    removeAuthToken
} from './api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loginWithGitHub: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const navigateTo = (url: string) => {
    window.location.href = url;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const { user } = await getCurrentUser();
            setUser(user);
        } catch (error) {
            setUser(null);
            throw error;
        }
    }, []);

    useEffect(() => {
        // Load current user
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const loginWithGitHub = async () => {
        try {
            const { url } = await getGitHubAuthUrl();
            navigateTo(url);
        } catch (error) {
            console.error('GitHub login error:', error);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { url } = await getGoogleAuthUrl();
            navigateTo(url);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch {
            // Ignore errors, just clear local state
        }
        removeAuthToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isAdmin: user?.isAdmin || false,
                loginWithGitHub,
                loginWithGoogle,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
