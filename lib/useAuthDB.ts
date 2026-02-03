import { User as UserType } from '@/Database/db';
import * as LocalStorage from '@/Database/localstorage';
import * as Session from '@/Database/session';
import * as Users from '@/Database/users';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAuthDBResult {
    user: UserType | null;
    session: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (userData: UserType, tokens?: { accessToken?: string; refreshToken?: string }) => Promise<boolean>;
    logout: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
    checkSession: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
    getAccessToken: () => Promise<string | null>;
}

/**
 * Hook personnalisé pour gérer l'authentification avec SQLite + Token Management
 * 
 * Fonctionnalités :
 * - Vérifie la session au montage du composant
 * - Récupère les informations complètes de l'utilisateur depuis la DB
 * - Permet de créer/supprimer une session
 * - Synchronise session et table users
 * - Gère les tokens JWT (accessToken et refreshToken)
 * - Rafraîchit automatiquement les tokens expirés
 * 
 * @example
 * const { user, isAuthenticated, accessToken, login, logout, refreshAccessToken } = useAuthDB();
 */
export const useAuthDB = (): UseAuthDBResult => {
    const [user, setUser] = useState<UserType | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    // Utiliser useRef pour éviter les appels multiples
    const isCheckingRef = useRef(false);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Décode le token JWT et retourne l'expiration en millisecondes
     */
    const getTokenExpiration = useCallback((token: string): number => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // Convertir en millisecondes
        } catch (error) {
            console.error('[AuthDB] ❌ Erreur décodage token:', error);
            return 0;
        }
    }, []);

    /**
     * Charge les tokens depuis le localStorage
     */
    const loadTokens = useCallback(async () => {
        const storedAccessToken = await LocalStorage.getItem('accessToken');
        const storedRefreshToken = await LocalStorage.getItem('refreshToken');

        if (storedAccessToken) setAccessToken(storedAccessToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);

        return { accessToken: storedAccessToken, refreshToken: storedRefreshToken };
    }, []);

    /**
     * Sauvegarde les tokens dans le localStorage
     */
    const saveTokens = useCallback(async (newAccessToken: string, newRefreshToken?: string) => {
        await LocalStorage.setItem('accessToken', newAccessToken);
        setAccessToken(newAccessToken);

        if (newRefreshToken) {
            await LocalStorage.setItem('refreshToken', newRefreshToken);
            setRefreshToken(newRefreshToken);
        }

        console.log('[AuthDB] ✅ Tokens sauvegardés');
    }, []);

    /**
     * Supprime les tokens du localStorage
     */
    const clearTokens = useCallback(async () => {
        await LocalStorage.removeItem('accessToken');
        await LocalStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        console.log('[AuthDB] 🗑️ Tokens supprimés');
    }, []);

    /**
     * Récupère le token d'accès actuel (depuis le state ou le storage)
     */
    const getAccessToken = useCallback(async (): Promise<string | null> => {
        if (accessToken) return accessToken;
        const stored = await LocalStorage.getItem('accessToken');
        if (stored) setAccessToken(stored);
        return stored;
    }, [accessToken]);

    /**
     * Rafraîchit le token d'accès en utilisant le refresh token
     * À personnaliser avec votre API
     */
    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        try {
            const currentRefreshToken = refreshToken || await LocalStorage.getItem('refreshToken');

            if (!currentRefreshToken) {
                console.warn('[AuthDB] ⚠️ Pas de refresh token disponible');
                return null;
            }

            console.log('[AuthDB] 🔄 Rafraîchissement du token...');

            // TODO: Remplacer par votre endpoint API
            const API_URL = 'https://votre-api.com';
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: currentRefreshToken })
            });

            if (!response.ok) {
                throw new Error('Échec du rafraîchissement du token');
            }

            const data = await response.json();
            const newAccessToken = data.accessToken;

            // Sauvegarder le nouveau token
            await saveTokens(newAccessToken, data.refreshToken);

            console.log('[AuthDB] ✅ Token rafraîchi avec succès');
            return newAccessToken;

        } catch (error) {
            console.error('[AuthDB] ❌ Erreur refresh token:', error);
            // En cas d'échec, déconnecter l'utilisateur
            await logout();
            return null;
        }
    }, [refreshToken, saveTokens]);

    /**
     * Configure le rafraîchissement automatique des tokens
     */
    const setupTokenAutoRefresh = useCallback(() => {
        // Nettoyer l'ancien interval s'il existe
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        if (!accessToken) return;

        // Vérifier l'expiration toutes les 30 secondes
        refreshIntervalRef.current = setInterval(async () => {
            const expiration = getTokenExpiration(accessToken);
            const now = Date.now();
            const timeUntilExpiry = expiration - now;

            // Rafraîchir 1 minute avant l'expiration
            if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
                console.log('[AuthDB] ⏰ Token expire bientôt, rafraîchissement...');
                await refreshAccessToken();
            }
        }, 30000);

        console.log('[AuthDB] ✅ Auto-refresh token configuré');
    }, [accessToken, getTokenExpiration, refreshAccessToken]);

    /**
     * Vérifie s'il existe une session active et charge l'utilisateur
     */
    const checkSession = useCallback(async () => {
        // Éviter les appels simultanés
        if (isCheckingRef.current) {
            console.log('[AuthDB] ⏭️ Vérification déjà en cours, skip');
            return;
        }

        try {
            isCheckingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('[AuthDB] 🔍 Vérification de la session...');

            // 1. Charger les tokens
            await loadTokens();

            // 2. Vérifier s'il y a une session
            const currentSession = await Session.get();

            if (!currentSession) {
                console.log('[AuthDB] ❌ Aucune session active');
                setUser(null);
                setSession(null);
                await clearTokens();
                return;
            }

            console.log('[AuthDB] ✅ Session trouvée:', currentSession.iduser);
            setSession(currentSession);

            // 3. Récupérer les informations complètes de l'utilisateur
            const userData = await Users.get(currentSession.iduser);

            if (!userData) {
                console.warn('[AuthDB] ⚠️ Utilisateur non trouvé pour la session');
                // Session invalide, la supprimer
                await Session.deleted();
                setSession(null);
                setUser(null);
                await clearTokens();
                return;
            }

            console.log('[AuthDB] ✅ Utilisateur chargé:', userData.email);
            setUser(userData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            console.error('[AuthDB] ❌ Erreur lors de la vérification:', err);
        } finally {
            setLoading(false);
            isCheckingRef.current = false;
        }
    }, [loadTokens, clearTokens]);

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

            console.log('[AuthDB] 🔐 Connexion...', userData.email);

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
            if (tokens?.accessToken) {
                await saveTokens(tokens.accessToken, tokens.refreshToken);
            }

            // 4. Mettre à jour le state
            setUser(savedUser);
            setSession(newSession);

            console.log('[AuthDB] ✅ Connexion réussie');
            return true;

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
            console.error('[AuthDB] ❌ Erreur de connexion:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [saveTokens]);

    /**
     * Déconnecte l'utilisateur (supprime la session et les tokens)
     */
    const logout = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);

            // Nettoyer l'auto-refresh
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }

            // Supprimer la session
            const deleted = await Session.deleted();

            if (deleted) {
                setUser(null);
                setSession(null);
                await clearTokens();
                console.log('[AuthDB] ✅ Déconnexion réussie');
                return true;
            }

            return false;

        } catch (err) {
            console.error('[AuthDB] ❌ Erreur de déconnexion:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [clearTokens]);

    /**
     * Rafraîchit les données de l'utilisateur depuis la DB
     */
    const refreshUser = useCallback(async () => {
        if (!session) {
            console.warn('[AuthDB] Pas de session active pour rafraîchir');
            return;
        }

        try {
            console.log('[AuthDB] 🔄 Rafraîchissement des données utilisateur...');

            const userData = await Users.get(session.iduser);

            if (userData) {
                setUser(userData);
                console.log('[AuthDB] ✅ Utilisateur rafraîchi');
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
        console.log('[AuthDB] 🚀 Hook monté, vérification de la session...');
        checkSession();

        // Ne pas ajouter checkSession aux dépendances pour éviter les boucles infinies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ Tableau vide = exécuté une seule fois au montage

    /**
     * Configurer l'auto-refresh des tokens quand un accessToken est disponible
     */
    useEffect(() => {
        if (accessToken) {
            setupTokenAutoRefresh();
        }

        // Cleanup à la déconnexion
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [accessToken, setupTokenAutoRefresh]);

    return {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user && !!session,
        accessToken,
        refreshToken,
        login,
        logout,
        refreshUser,
        checkSession,
        refreshAccessToken,
        getAccessToken,
    };
};