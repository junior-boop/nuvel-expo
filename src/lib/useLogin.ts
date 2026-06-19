import { useAuth } from "@/context/auth.context";
import { useDatabase } from "@/context/database.context";
import { User } from "@/Database/db";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export default function useLogin({ name, first_name, email }: { name: string, first_name: string, email: string }) {
    const [loading, setloading] = useState(false)
    const { adduser } = useDatabase()
    const { signIn, error } = useAuth()

    const handleUser = useCallback(async () => {
        if (name === '' || first_name === '' || email === '') {
            Alert.alert("Error", "Name, First Name and Email are required")
            return
        }

        try {
            setloading(true)

            const { ok, user } = await signIn({ name, first_name, email })

            if (!ok || !user) {
                Alert.alert("Error", error ?? "Failed to sign in")
                return
            }

            if (__DEV__) console.log('[useLogin] ✅ Session créée, userData:', user);

            await adduser(user)

            // One-shot: si l'utilisateur a déjà des notes côté serveur, proposer la sync.
            // Le reste (profil incomplet → /profile, complet → /(tabs)) est géré par AuthGate.
            const notesCount = (user as User & { notes?: { count?: number } }).notes?.count ?? 0
            if (notesCount > 0) {
                router.replace({
                    pathname: "/sync" as never,
                    params: {
                        id: user.id,
                        name: user.name,
                        first_name: user.first_name,
                        email: user.email,
                    },
                })
            }
        } catch (e) {
            console.error("[useLogin] ❌ Erreur réseau:", e)
            Alert.alert("Error", "Network error. Please try again.")
        } finally {
            setloading(false)
        }
    }, [name, first_name, email, signIn, adduser, error])

    return {
        loading,
        handleUser,
    }
}
