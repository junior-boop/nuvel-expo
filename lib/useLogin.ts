import { server_url } from "@/constants/server_url";
import { User } from "@/Database/db";
import { useCallback, useState } from "react";
import { useAuthDB } from "./useAuthDB";

export default function useLogin({name, first_name, email}: { name : string, first_name:string, email:string}){
        const [loading, setloading] = useState(false)
    
        const { login, error } = useAuthDB()
    const getuserinfo = useCallback(async (data: Partial<User>) => {
        try{
            setloading(true)
            const response = await fetch(`${server_url}/users/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json() as { data: User, status: string };
            return await login(result.data)
        } catch (e) {
            console.log("network error", e, "local error:", error)
            setloading(false)
        } finally {
            setloading(false)
        }
    }, [])
    
    const handleUser = useCallback(async () => {
        await getuserinfo({ name, first_name, email })    
    }, [name, first_name, email])
    return{
        loading,
        handleUser
    }
}