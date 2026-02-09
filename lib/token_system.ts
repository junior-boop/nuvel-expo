import * as localStorage from '@/Database/localstorage';
import { server_url } from '@/constants/server_url';
// Configuration

let accessToken = (async () => await localStorage.getItem('accessToken'))()
let refreshToken = (async () => await localStorage.getItem('refreshToken'))()


// Fonction pour rafraîchir le token
async function refreshAccessToken() {
    try {
        const response = await fetch(`${server_url}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: await refreshToken })
        });

        const data = await response.json();
        accessToken = data.accessToken;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        // Si le refresh échoue, rediriger vers login
        return null;
    }
}

// Intercepteur pour les requêtes API
export async function apiRequest(url: string, options = {}) {
    // Première tentative avec le token actuel
    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${await accessToken}`
        }
    });

    // Si 401 (non autorisé), rafraîchir et réessayer
    if (response.status === 401) {
        await refreshAccessToken();

        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${await accessToken}`
            }
        });
    }

    return response;
}

function getTokenExpiration(token: string) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convertir en millisecondes
}

// Vérifier et rafraîchir automatiquement
function setupAutoRefresh() {

    const checkInterval = setInterval(async () => {
        console.log("token [token_system]", await accessToken)
        const expiration = getTokenExpiration(await accessToken as string);
        const now = Date.now();
        const timeUntilExpiry = expiration - now;

        // Rafraîchir 1 minute avant l'expiration
        if (timeUntilExpiry < 60000) {
            await refreshAccessToken();
        }
    }, 30000); // Vérifier toutes les 30 secondes

    // Retourner une fonction de nettoyage pour éviter les fuites mémoire
    return () => {
        clearInterval(checkInterval);
        console.log('[TokenSystem] ✅ Auto-refresh interval cleared');
    };
}


// Initialiser l'auto-refresh et stocker la fonction de nettoyage
const cleanupAutoRefresh = setupAutoRefresh();

// Export de la fonction de nettoyage pour utilisation externe
export { cleanupAutoRefresh, refreshAccessToken };

