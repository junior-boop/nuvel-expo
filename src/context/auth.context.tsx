import { useAuthDB } from '@/lib/useAuthDB';
import React, { createContext, ReactNode, useContext } from 'react';

type AuthContextValue = ReturnType<typeof useAuthDB>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthDB();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}
