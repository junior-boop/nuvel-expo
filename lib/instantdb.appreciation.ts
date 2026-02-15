import { id } from "@instantdb/react-native";
import { db } from "./instantdb.init";

export const setAppreciation = async (articleId: string, creator: string) => {
    try {
        // Générer un seul ID pour éviter les duplications
        const appreciationId = id();

        const appreciation = await db.transact(db.tx.appreciation[appreciationId].create({
            id: appreciationId,
            articleId: articleId,
            userId: creator
        }))

        return appreciation.clientId
    } catch (error) {
        console.log(error)
    }
}

export const removeAppreciation = async (id: string) => {
    try {
        console.log("[removeAppreciation] ID", id)
        const appreciation = await db.transact(db.tx.appreciation[id].delete())
        console.log("[removeAppreciation] Appreciation Removed", appreciation)
        return appreciation.clientId
    } catch (error) {
        console.log("[removeAppreciation] Error", error)
    }
}

export const getAppreciationStateForUser = async (userId: string, articleId: string) => {
    try {
        const query = {
            appreciation: {
                $: {
                    where: {
                        userId: userId,
                        articleId: articleId,
                    },
                },
            }
        }
        const data = db.queryOnce(query)
        return data
    } catch (error) {
        console.log("[getAppreciationStateForUser] Error", error)
    }

}