'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [theme, setTheme] = useState('dark');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 1. Initialize Theme and Session on Mount
    useEffect(() => {
        // Theme initialization
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        // Session check
        syncSession();
    }, []);

    // 2. Sync Session from Backend
    const syncSession = async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setAdmin(data.admin);
                setCartCount(data.cartCount || 0);
            } else {
                setUser(null);
                setAdmin(null);
                setCartCount(0);
            }
        } catch (err) {
            console.error('Failed to sync session:', err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Toggle Theme
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    // 4. Logout User
    const logout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUser(null);
                setCartCount(0);
                router.push('/login');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    // 5. Logout Admin
    const logoutAdmin = async () => {
        try {
            const res = await fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setAdmin(null);
                router.push('/login?admin=true');
            }
        } catch (err) {
            console.error('Admin logout error:', err);
        }
    };

    return (
        <AppContext.Provider value={{
            user,
            setUser,
            admin,
            setAdmin,
            cartCount,
            setCartCount,
            theme,
            toggleTheme,
            loading,
            syncSession,
            logout,
            logoutAdmin
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
