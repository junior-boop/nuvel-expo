import { server_url } from "@/constants/server_url";
import { useDatabase } from "@/context/database.context";
import { User } from "@/Database/db";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useAuthDB } from "./useAuthDB";

export default function useLogin({ name, first_name, email }: { name: string, first_name: string, email: string }) {
    const [loading, setloading] = useState(false)
    const { usersQuery, adduser } = useDatabase()

    const { login, error } = useAuthDB()


    const getuserinfo = useCallback(async (data: Partial<User>) => {
        if (name === '' || first_name === '' || email === '') {
            Alert.alert("Error", "Name, First Name and Email are required")
            return
        }
        try {
            setloading(true)

            // 1. Appel API pour signin
            const response = await fetch(`${server_url}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json() as { user: User, success: boolean, accessToken: string, refreshToken: string };

            // 2. Créer la session locale avec useAuthDB
            const loginSuccess = await login(result.user, { accessToken: result.accessToken, refreshToken: result.refreshToken })

            if (!loginSuccess) {
                Alert.alert("Error", "Failed to create local session")
                return
            }

            console.log('[useLogin] ✅ Session créée, userData:', result.user);

            await adduser(result.user)

            // 3. Préparer les params pour la navigation
            const params = {
                id: result.user.id,
                name: result.user.name,
                first_name: result.user.first_name,
                email: result.user.email
            }

            // 4. Vérifier si l'utilisateur doit compléter son profil
            if (result.user.photo === null || result.user.biography === null || result.user.biography === '') {
                console.log('[useLogin] 📝 Profil incomplet, redirection vers /loginzone/usersinfos');
                router.replace({
                    pathname: "/loginzone/usersinfos",
                    params
                })
            } else if (result.user.notes.count > 0) {
                console.log('[useLogin] 📝 Profil incomplet, redirection vers /loginzone/usersinfos');
                router.replace({
                    pathname: "/loginzone/sync_note_group",
                    params
                })
            } else {
                console.log('[useLogin] ✅ Profil complet, redirection vers /(tabs)');
                router.replace({
                    pathname: "/(tabs)",
                    params
                })
            }

        } catch (e) {
            console.error("[useLogin] ❌ Erreur réseau:", e, "Erreur locale:", error)
            Alert.alert("Error", "Network error. Please try again.")
        } finally {
            setloading(false)
        }
    }, [name, first_name, email, login, error])


    const handleUser = useCallback(async () => {
        await getuserinfo({ name, first_name, email })
    }, [getuserinfo, name, first_name, email])

    return {
        loading,
        handleUser
    }
}
