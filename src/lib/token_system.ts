import * as localStorage from '@/Database/localstorage';
import { server_url } from '@/constants/server_url';

// Configuration - Store tokens as strings, not promises
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage
async function initializeTokens() {
    accessToken = await localStorage.getItem('accessToken');
    refreshToken = await localStorage.getItem('refreshToken');
    if (__DEV__) console.log('[TokenSystem] Tokens initialized:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
    });
}

// Initialize immediately
initializeTokens();

// Fonction pour rafraîchir le token
async function refreshAccessToken() {
    try {
        if (!refreshToken) {
            if (__DEV__) console.log('[TokenSystem] No refresh token available');
            return null;
        }

        const response = await fetch(`${server_url}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.accessToken;
        await localStorage.setItem('accessToken', accessToken as string);
        if (__DEV__) console.log('[TokenSystem] ✅ Access token refreshed');
        return accessToken;
    } catch (error) {
        console.error('[TokenSystem] ❌ Refresh failed:', error);
        // Si le refresh échoue, rediriger vers login
        return null;
    }
}

// Export function to get current access token
export async function getAccessToken(): Promise<string | null> {
    // Ensure tokens are initialized
    if (accessToken === null && refreshToken === null) {
        await initializeTokens();
    }
    return accessToken;
}

// Export function to set tokens (for login)
export async function setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    await localStorage.setItem('accessToken', access);
    await localStorage.setItem('refreshToken', refresh);
    if (__DEV__) console.log('[TokenSystem] ✅ Tokens set');
}

// Export function to clear tokens (for logout)
export async function clearTokens() {
    accessToken = null;
    refreshToken = null;
    await localStorage.removeItem('accessToken');
    await localStorage.removeItem('refreshToken');
    if (__DEV__) console.log('[TokenSystem] 🗑️ Tokens cleared');
}

// Intercepteur pour les requêtes API
export async function apiRequest(url: string, options: any = {}) {
    const currentAccessToken = await getAccessToken();

    // Première tentative avec le token actuel
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${currentAccessToken}`
        }
    });

    // Si 401 (non autorisé), rafraîchir et réessayer
    if (response.status === 401) {
        const newToken = await refreshAccessToken();

        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`
            }
        });
    }

    return response;
}

function getTokenExpiration(token: string) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Convertir en millisecondes
    } catch (error) {
        console.error('[TokenSystem] Failed to parse token:', error);
        return 0;
    }
}

// Vérifier et rafraîchir automatiquement
function setupAutoRefresh() {

    const checkInterval = setInterval(async () => {
        const currentAccessToken = await getAccessToken();

        if (currentAccessToken) {
            const expiration = getTokenExpiration(currentAccessToken);
            const now = Date.now();
            const timeUntilExpiry = expiration - now;

            // Rafraîchir 1 minute avant l'expiration
            if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
                if (__DEV__) console.log('[TokenSystem] Token expiring soon, refreshing...');
                await refreshAccessToken();
            }
        } else {
            // await refreshAccessToken();
            if (__DEV__) console.log('[TokenSystem] No access token available', currentAccessToken);
        }
    }, 30000); // Vérifier toutes les 30 secondes

    // Retourner une fonction de nettoyage pour éviter les fuites mémoire
    return () => {
        clearInterval(checkInterval);
        if (__DEV__) console.log('[TokenSystem] ✅ Auto-refresh interval cleared');
    };
}


// Initialiser l'auto-refresh et stocker la fonction de nettoyage
const cleanupAutoRefresh = setupAutoRefresh();

// Export de la fonction de nettoyage pour utilisation externe
export { cleanupAutoRefresh, refreshAccessToken };

