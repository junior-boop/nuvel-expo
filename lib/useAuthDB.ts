import { User as UserType } from '@/Database/db';
import * as Session from '@/Database/session';
import * as Users from '@/Database/users';
import { clearTokens as clearTokensSystem, setTokens } from '@/lib/token_system';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAuthDBResult {
    user: UserType | null;
    session: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
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
            console.log('[AuthDB] ⏭️ Vérification déjà en cours, skip');
            return;
        }

        try {
            isCheckingRef.current = true;
            setLoading(true);
            setError(null);

            console.log('[AuthDB] 🔍 Vérification de la session...');

            // Vérifier s'il y a une session
            const currentSession = await Session.get();

            if (!currentSession) {
                console.log('[AuthDB] ❌ Aucune session active');
                setUser(null);
                setSession(null);
                await clearTokensSystem();
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
                await clearTokensSystem();
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

            console.log(userData, tokens)
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
            if (tokens?.accessToken && tokens?.refreshToken) {
                await setTokens(tokens.accessToken, tokens.refreshToken);
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
    }, []);

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

    return {
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user && !!session,
        login,
        logout,
        refreshUser,
        checkSession,
    };
};