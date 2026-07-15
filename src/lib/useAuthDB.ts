import { server_url } from '@/constants/server_url';
import { User as UserType } from '@/Database/db';
import * as Session from '@/Database/session';
import * as Users from '@/Database/users';
import { safeFetch } from '@/lib/safeFetch';
import { clearTokens as clearTokensSystem, setTokens } from '@/lib/token_system';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SignInCredentials {
    name: string;
    first_name: string;
    email: string;
}

export interface SignInResult {
    ok: boolean;
    user?: UserType;
}

interface UseAuthDBResult {
    user: UserType | null;
    session: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    signIn: (credentials: SignInCredentials) => Promise<SignInResult>;
    login: (userData: UserType, tokens?: { accessToken?: string; refreshToken?: string }) => Promise<boolean>;
    logout: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
    checkSession: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer l'authentification avec SQLite
 * 
 * Fonctionnalités :
 * - Vérifie la session au montage du composant
 * - Récupère les informations complètes de l'utilisateur depuis la DB
 * - Permet de créer/supprimer une session
 * - Synchronise session et table users
 * - Délègue la gestion des tokens au système centralisé (token_system.ts)
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuthDB();
 */
export const useAuthDB = (): UseAuthDBResult => {
    const [user, setUser] = useState<UserType | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Utiliser useRef pour éviter les appels multiples
    const isCheckingRef = useRef(false);

    // Token management is now handled by token_system.ts
    // No duplicate token state or auto-refresh logic needed here

    /**
     * Vérifie s'il existe une session active et charge l'utilisateur
     */
    const checkSession = useCallback(async () => {
        // Éviter les appels simultanés
        if (isCheckingRef.current) {
            if (__DEV__) console.log('[AuthDB] ⏭️ Vérification déjà en cours, skip');
            return;
        }

        try {
            isCheckingRef.current = true;
            setLoading(true);
            setError(null);

            if (__DEV__) console.log('[AuthDB] 🔍 Vérification de la session...');

            // Vérifier s'il y a une session
            const currentSession = await Session.get();

            if (!currentSession) {
                if (__DEV__) console.log('[AuthDB] ❌ Aucune session active');
                setUser(null);
                setSession(null);
                await clearTokensSystem();
                return;
            }

            if (__DEV__) console.log('[AuthDB] ✅ Session trouvée:', currentSession.iduser);
            setSession(currentSession);

            // 3. Récupérer les informations complètes de l'utilisateur
            const userData = await Users.get(currentSession.iduser);

            if (!userData) {
                console.warn('[AuthDB] ⚠️ Utilisateur non trouvé pour la session');
                // Session invalide, la supprimer
                await Session.deleted();
                setSession(null);
                setUser(null);
                await clearTokensSystem();
                return;
            }

            if (__DEV__) console.log('[AuthDB] ✅ Utilisateur chargé:', userData.email);
            setUser(userData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            console.error('[AuthDB] ❌ Erreur lors de la vérification:', err);
        } finally {
            setLoading(false);
            isCheckingRef.current = false;
        }
    }, []);

    /**
     * Connecte un utilisateur (crée une session et enregistre l'utilisateur + tokens)
     */
    const login = useCallback(async (
        userData: UserType,
        tokens?: { accessToken?: string; refreshToken?: string }
    ): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            if (__DEV__) console.log(userData, tokens)
            if (__DEV__) console.log('[AuthDB] 🔐 Connexion...', userData.email);

            // 1. Créer/mettre à jour l'utilisateur dans la table users
            const savedUser = await Users.created(userData);

            if (!savedUser) {
                throw new Error('Impossible de sauvegarder l\'utilisateur');
            }

            // 2. Créer la session
            const newSession = await Session.set(savedUser);

            if (!newSession) {
                throw new Error('Impossible de créer la session');
            }

            // 3. Sauvegarder les tokens si fournis
            if (tokens?.accessToken && tokens?.refreshToken) {
                await setTokens(tokens.accessToken, tokens.refreshToken);
            }

            // 4. Mettre à jour le state
            setUser(savedUser);
            setSession(newSession);

            if (__DEV__) console.log('[AuthDB] ✅ Connexion réussie');
            return true;

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
            console.error('[AuthDB] ❌ Erreur de connexion:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Authentifie via l'API puis crée la session locale.
     * Source de vérité unique pour l'appel /auth/login.
     */
    const signIn = useCallback(async (credentials: SignInCredentials): Promise<SignInResult> => {
        try {
            setLoading(true);
            setError(null);

            const res = await safeFetch<{
                user: UserType;
                success?: boolean;
                accessToken?: string;
                refreshToken?: string;
            }>(`${server_url}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            }, { skipOnlineCheck: true });

            // Fallback offline / serveur injoignable : si un utilisateur local correspond
            // à l'email fourni, autoriser la connexion à partir des données locales.
            if (!res.ok) {
                if (res.offline || res.status === 0 || res.timeout) {
                    const allUsers = await Users.getAll();
                    const localMatch = (allUsers || []).find(u => u.email === credentials.email);
                    if (localMatch) {
                        if (__DEV__) console.log('[AuthDB] 🛰️ offline signIn — using local user');
                        const ok = await login(localMatch);
                        return { ok, user: ok ? localMatch : undefined };
                    }
                    setError('Connexion requise pour la première utilisation');
                    return { ok: false };
                }
                setError(`Auth failed (${res.status})`);
                return { ok: false };
            }

            const result = res.data;
            if (!result?.user) {
                setError('Invalid auth response: missing user');
                return { ok: false };
            }

            const ok = await login(result.user, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });

            return { ok, user: ok ? result.user : undefined };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
            console.error('[AuthDB] ❌ signIn:', err);
            return { ok: false };
        } finally {
            setLoading(false);
        }
    }, [login]);

    /**
     * Déconnecte l'utilisateur (supprime la session et les tokens)
     */
    const logout = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);

            // Supprimer la session
            const deleted = await Session.deleted();

            if (deleted) {
                setUser(null);
                setSession(null);
                await clearTokensSystem();
                if (__DEV__) console.log('[AuthDB] ✅ Déconnexion réussie');
                return true;
            }

            return false;

        } catch (err) {
            console.error('[AuthDB] ❌ Erreur de déconnexion:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Rafraîchit les données de l'utilisateur depuis la DB
     */
    const refreshUser = useCallback(async () => {
        if (!session) {
            console.warn('[AuthDB] Pas de session active pour rafraîchir');
            return;
        }

        try {
            if (__DEV__) console.log('[AuthDB] 🔄 Rafraîchissement des données utilisateur...');

            const userData = await Users.get(session.iduser);

            if (userData) {
                setUser(userData);
                if (__DEV__) console.log('[AuthDB] ✅ Utilisateur rafraîchi');
            } else {
                // L'utilisateur n'existe plus, supprimer la session
                await logout();
            }

        } catch (err) {
            console.error('[AuthDB] ❌ Erreur refresh:', err);
        }
    }, [session, logout]);

    /**
     * Vérifier la session au montage du composant UNE SEULE FOIS
     */
    useEffect(() => {
        if (__DEV__) console.log('[AuthDB] 🚀 Hook monté, vérification de la session...');
        checkSession();

        // Ne pas ajouter checkSession aux dépendances pour éviter les boucles infinies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ Tableau vide = exécuté une seule fois au montage

    return {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user && !!session,
        signIn,
        login,
        logout,
        refreshUser,
        checkSession,
    };
};