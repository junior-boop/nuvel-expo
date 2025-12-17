import { User as UserType } from '@/Database/db';
import * as Session from '@/Database/session';
import * as Users from '@/Database/users';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

interface UseAuthDBResult {
    user: UserType | null;
    session: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (userData: UserType) => Promise<boolean>;
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
 * - Redirige automatiquement selon le profil utilisateur
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuthDB();
 */
export const useAuthDB = (): UseAuthDBResult => {
    const [user, setUser] = useState<UserType | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    /**
     * Redirige l'utilisateur selon son profil
     */
    const handleUserRedirection = useCallback((userData: UserType) => {
        const params = {
            id: userData.id,
            name: userData.name,
            first_name: userData.first_name,
            email: userData.email
        };

        
        if (userData.photo === null || userData.biography === null) {
            router.replace({
                pathname: "/loginzone/usersinfos",
                params
            });
        } else {
            
            router.replace({
                pathname: "/(tabs)",
                params
            });
        }
    }, []);

    /**
     * Vérifie s'il existe une session active et charge l'utilisateur
     */
    const checkSession = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Vérifier s'il y a une session
            const currentSession = await Session.get();

            if (!currentSession) {
                console.log('[AuthDB] Aucune session active');
                setUser(null);
                setSession(null);
                return;
            }

            console.log('[AuthDB] Session trouvée:', currentSession.iduser);
            setSession(currentSession);

            // 2. Récupérer les informations complètes de l'utilisateur
            const userData = await Users.get(currentSession.iduser);

            if (!userData) {
                console.warn('[AuthDB] Utilisateur non trouvé pour la session');
                // Session invalide, la supprimer
                await Session.deleted();
                setSession(null);
                setUser(null);
                return;
            }

            console.log('[AuthDB] ✅ Utilisateur chargé:', userData.email);
            setUser(userData);

            // 3. Rediriger l'utilisateur selon son profil
            handleUserRedirection(userData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            console.error('[AuthDB] ❌ Erreur lors de la vérification:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Connecte un utilisateur (crée une session et enregistre l'utilisateur)
     */
    const login = useCallback(async (userData: UserType): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            console.log('[AuthDB] Connexion...', userData.email);

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

            // 3. Mettre à jour le state
            setUser(savedUser);
            setSession(newSession);
            setIsAuthenticated(true);

            console.log('1 [AuthDB] ✅ Connexion réussie');

            // 4. Rediriger l'utilisateur selon son profil
            handleUserRedirection(savedUser);

            return true;

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur de connexion';
            setError(message);
            console.error('[AuthDB] ❌ Erreur de connexion:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [handleUserRedirection]);

    /**
     * Déconnecte l'utilisateur (supprime la session)
     */
    const logout = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);

            // Supprimer la session
            const deleted = await Session.deleted();

            if (deleted) {
                setUser(null);
                setSession(null);
                console.log('[AuthDB] ✅ Déconnexion réussie');
                return true;
            }
            setIsAuthenticated(false);

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
            console.log('[AuthDB] Rafraîchissement des données utilisateur...');

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
     * Vérifier la session au montage du composant
     */
    // useEffect(() => {
    //     checkSession();
    // }, []);

    return {
        user,
        session,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        checkSession,
    };
};