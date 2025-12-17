// hooks/useAuth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  photo?: string;
  biography?: string;
  church_status?: string;
  country?: string;
  created: string;
  modified: string;
}
interface SignInData {
  email: string;
  name?: string;
  first_name?: string;
  photo?: string;
  church_status?: string;
  country?: string;
}
interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (userData: SignInData) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}
const USER_STORAGE_KEY = '@nuvel_user';
export const useAuth = (
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Charger l'utilisateur depuis le stockage au montage
  useEffect(() => {
    loadUserFromStorage();
  }, []);
  // Charger depuis AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (userData) {
        setUser(JSON.parse(userData));
        console.log('[Auth] Utilisateur chargé depuis le stockage');
      }
    } catch (err) {
      console.error('[Auth] Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };
  // Sauvegarder dans AsyncStorage
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('[Auth] Utilisateur sauvegardé');
    } catch (err) {
      console.error('[Auth] Erreur sauvegarde:', err);
    }
  };
  // Sign In / Sign Up
  const signIn = useCallback(async (userData: SignInData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Connexion...', userData.email);
      const response = await fetch(`${apiBase}/users/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.data) {
        setUser(result.data);
        await saveUserToStorage(result.data);
        
        console.log('[Auth] ✅ Connexion réussie:', result.message);
        return true;
      } else {
        throw new Error(result.message || 'Erreur de connexion');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[Auth] ❌ Erreur:', message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiBase]);
  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      console.log('[Auth] Déconnexion réussie');
    } catch (err) {
      console.error('[Auth] Erreur déconnexion:', err);
    }
  }, []);
  // Rafraîchir les infos utilisateur
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${apiBase}/users/${user.id}`);
      const updatedUser = await response.json();
      
      setUser(updatedUser);
      await saveUserToStorage(updatedUser);
      console.log('[Auth] Utilisateur rafraîchi');
    } catch (err) {
      console.error('[Auth] Erreur refresh:', err);
    }
  }, [user, apiBase]);
  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    refreshUser,
  };
};