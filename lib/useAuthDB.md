# 📚 Documentation - Hook `useAuthDB`

## 📖 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Installation](#installation)
- [Utilisation rapide](#utilisation-rapide)
- [API Référence](#api-référence)
- [Exemples détaillés](#exemples-détaillés)
- [Guide d'intégration](#guide-dintégration)
- [Gestion des erreurs](#gestion-des-erreurs)
- [Bonnes pratiques](#bonnes-pratiques)
- [FAQ](#faq)

---

## 🎯 Vue d'ensemble

`useAuthDB` est un hook React personnalisé qui gère l'authentification utilisateur avec **SQLite** (via Expo SQLite). Il synchronise automatiquement la table `session` et la table `users`.

### Fonctionnalités principales

✅ **Vérification automatique** de la session au démarrage  
✅ **Gestion complète** du cycle de vie utilisateur  
✅ **Synchronisation** session ↔ utilisateur  
✅ **Nettoyage automatique** des sessions invalides  
✅ **TypeScript natif** avec typage complet  

---

## 📦 Installation

Le hook est déjà inclus dans votre projet. Aucune installation supplémentaire n'est nécessaire.

### Prérequis

- Expo SQLite configuré
- Tables `session` et `users` créées dans la base de données

---

## ⚡ Utilisation rapide

```typescript
import { useAuthDB } from '@/lib/useAuthDB';

function App() {
    const { user, isAuthenticated, login, logout } = useAuthDB();

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return <HomeScreen user={user} onLogout={logout} />;
}
```

---

## 📘 API Référence

### Valeurs retournées

| Propriété | Type | Description |
|-----------|------|-------------|
| `user` | `UserType \| null` | Objet utilisateur complet depuis la DB |
| `session` | `Session \| null` | Objet session actif |
| `loading` | `boolean` | Indique si une opération est en cours |
| `error` | `string \| null` | Message d'erreur si applicable |
| `isAuthenticated` | `boolean` | `true` si utilisateur connecté et session valide |

### Méthodes

#### `login(userData: UserType): Promise<boolean>`

Connecte un utilisateur en créant un compte dans la DB et une session.

**Paramètres :**
```typescript
{
    id: string;                    // ID unique de l'utilisateur
    name: string;                  // Nom de famille
    first_name: string;            // Prénom
    email: string;                 // Email (unique)
    church_status?: string;        // Statut dans l'église
    biography?: string;            // Biographie
    photo?: string;                // URL de la photo
    country?: string;              // Pays
    created: string;               // Date de création (ISO)
    modified: string;              // Date de modification (ISO)
}
```

**Retour :**
- `true` si la connexion réussit
- `false` en cas d'erreur

**Exemple :**
```typescript
const success = await login({
    id: 'user_abc123',
    name: 'Dupont',
    first_name: 'Marie',
    email: 'marie@example.com',
    church_status: 'Member',
    country: 'France',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
});

if (success) {
    router.replace('/home');
}
```

---

#### `logout(): Promise<boolean>`

Déconnecte l'utilisateur en supprimant la session.

**Retour :**
- `true` si la déconnexion réussit
- `false` en cas d'erreur

**Exemple :**
```typescript
const handleLogout = async () => {
    const success = await logout();
    if (success) {
        router.replace('/login');
    }
};
```

---

#### `refreshUser(): Promise<void>`

Rafraîchit les données de l'utilisateur depuis la base de données.

**Exemple :**
```typescript
const handleRefresh = async () => {
    await refreshUser();
    console.log('Données rafraîchies !');
};
```

---

#### `checkSession(): Promise<void>`

Vérifie manuellement s'il existe une session active et charge l'utilisateur.

> **Note :** Cette méthode est automatiquement appelée au montage du composant.

**Exemple :**
```typescript
const handleCheckSession = async () => {
    await checkSession();
};
```

---

## 💡 Exemples détaillés

### Exemple 1 : Page de connexion

```typescript
import { useAuthDB } from '@/lib/useAuthDB';
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
    const { login, loading, error } = useAuthDB();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleLogin = async () => {
        const userData = {
            id: `user_${Date.now()}`,
            name: name,
            first_name: '',
            email: email,
            church_status: 'Member',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
        };

        const success = await login(userData);

        if (success) {
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Nom"
                value={name}
                onChangeText={setName}
            />
            <Button
                title={loading ? "Connexion..." : "Se connecter"}
                onPress={handleLogin}
                disabled={loading}
            />
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
        </View>
    );
}
```

---

### Exemple 2 : Protection de route

```typescript
import { useAuthDB } from '@/lib/useAuthDB';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedScreen() {
    const { isAuthenticated, loading } = useAuthDB();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <View>
            {/* Contenu protégé */}
        </View>
    );
}
```

---

### Exemple 3 : Profil utilisateur

```typescript
import { useAuthDB } from '@/lib/useAuthDB';
import { View, Text, Image, Button } from 'react-native';

export default function ProfileScreen() {
    const { user, refreshUser, logout, loading } = useAuthDB();

    if (!user) return null;

    return (
        <View style={{ padding: 20 }}>
            {user.photo && (
                <Image
                    source={{ uri: user.photo }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                />
            )}
            <Text style={{ fontSize: 24 }}>{user.name} {user.first_name}</Text>
            <Text>{user.email}</Text>
            <Text>{user.church_status}</Text>
            <Text>{user.biography}</Text>

            <Button
                title={loading ? "Rafraîchissement..." : "Rafraîchir"}
                onPress={refreshUser}
                disabled={loading}
            />
            <Button
                title="Se déconnecter"
                onPress={logout}
                color="red"
            />
        </View>
    );
}
```

---

## 🔧 Guide d'intégration

### Intégration dans `_layout.tsx`

Pour protéger toute votre application :

```typescript
import { useAuthDB } from '@/lib/useAuthDB';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
    const { isAuthenticated, loading } = useAuthDB();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Autres screens */}
        </Stack>
    );
}
```

---

### Utilisation avec un Context Provider

Pour partager l'état d'authentification dans toute l'app :

```typescript
// context/AuthContext.tsx
import { useAuthDB } from '@/lib/useAuthDB';
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const auth = useAuthDB();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

Puis dans `_layout.tsx` :

```typescript
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                {/* Vos screens */}
            </Stack>
        </AuthProvider>
    );
}
```

---

## ⚠️ Gestion des erreurs

Le hook gère automatiquement les erreurs et les expose via la propriété `error`.

```typescript
const { error } = useAuthDB();

if (error) {
    console.error('Erreur d\'authentification:', error);
}
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Impossible de sauvegarder l'utilisateur` | Email déjà existant ou champs manquants | Vérifier l'unicité de l'email |
| `Impossible de créer la session` | Problème avec la table session | Vérifier que la table existe |
| `Utilisateur non trouvé pour la session` | Session orpheline | Session supprimée automatiquement |

---

## ✨ Bonnes pratiques

### 1. Toujours vérifier `loading`

```typescript
const { loading, isAuthenticated } = useAuthDB();

if (loading) {
    return <LoadingScreen />;
}
```

### 2. Gérer les erreurs

```typescript
const { error, login } = useAuthDB();

const handleLogin = async (data) => {
    await login(data);
    if (error) {
        Alert.alert('Erreur', error);
    }
};
```

### 3. Rafraîchir après modification

```typescript
const handleUpdateProfile = async (newData) => {
    await Users.updated(newData);
    await refreshUser(); // ✅ Rafraîchir le state
};
```

### 4. Nettoyer au démontage

Le hook gère automatiquement le nettoyage, mais vous pouvez ajouter :

```typescript
useEffect(() => {
    return () => {
        // Cleanup si nécessaire
    };
}, []);
```

---

## ❓ FAQ

### Q: La session persiste-t-elle après redémarrage de l'app ?

**R:** Oui, la session est stockée dans SQLite qui persiste localement.

---

### Q: Peut-on avoir plusieurs sessions ?

**R:** Non, le hook utilise un ID de session fixe (`sessionuser-01`). Une seule session active à la fois.

---

### Q: Comment gérer plusieurs utilisateurs ?

**R:** Modifiez `Session.set()` pour accepter un ID de session dynamique.

---

### Q: Le hook fonctionne-t-il hors ligne ?

**R:** Oui, puisqu'il utilise SQLite local. Aucune connexion internet requise.

---

### Q: Comment synchroniser avec un serveur ?

**R:** Ajoutez une logique de sync dans `login()` :

```typescript
const login = async (userData) => {
    // 1. Appel API
    const response = await fetch('/api/login', { ... });
    const serverData = await response.json();

    // 2. Sauvegarder localement
    return await originalLogin(serverData);
};
```

---

## 📞 Support

Pour toute question ou problème, consultez :
- Le code source : `lib/useAuthDB.ts`
- Les exemples : `lib/useAuthDB.examples.tsx`

---

**Version:** 1.0.0  
**Dernière mise à jour:** 16 décembre 2025
