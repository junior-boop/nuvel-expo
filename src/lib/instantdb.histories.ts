import { APP_ID_HISTOIRE } from '@/constants/server_url';
import { i, id, init, InstaQLEntity } from '@instantdb/react-native';

const schema = i.schema({
    entities: {
        histories: i.entity({
            id: i.string().unique().indexed(),
            articleId: i.string(),
            userId: i.string().indexed(),
            content: i.json<{ title: string, image: string; createdAt: Date }>(),
            createdAt: i.date().indexed(),
        }),
    }
})
export type HistoryType = InstaQLEntity<typeof schema, 'histories'>

export const historiesDB = init({
    appId: APP_ID_HISTOIRE,
    schema,
    devtool: true
})


export const createdHistoryItem = async (articleId: string, creator: string, content: { title: string, image: string; createdAt: Date }) => {
    try {
        // Générer un seul ID pour éviter les duplications
        const historyId = id();

        const check = await getHistoryByArticleId(articleId, creator)
        if (check) {
            await updatedHistoryItem(check.data.histories[0].id)
            return 'sucess'
        }

        const comment = await historiesDB.transact(historiesDB.tx.histories[historyId].create({
            id: historyId,
            articleId: articleId,
            userId: creator,
            content: content,
            createdAt: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        if (__DEV__) console.log(error)
    }
}

export const getHistoryForUser = async (userid: string) => {

    try {
        const query = {
            histories: {
                $: {
                    where: {
                        userId: userid,
                    },
                    order: {
                        createdAt: 'desc' as const,
                    },
                },
            }
        }
        const data = historiesDB.queryOnce(query)
        return data
    } catch (error) {
        if (__DEV__) console.log("[deleteHistoryItem] Error", error)
    }

}



export const getHistoryByArticleId = async (articleId: string, userId: string) => {
    try {
        const query = {
            histories: {
                $: {
                    where: {
                        articleId: articleId,
                        userId: userId,
                    },
                },
            }
        }
        const data = historiesDB.queryOnce(query)
        return data
    } catch (error) {
        if (__DEV__) console.log("[getHistoryById] Error", error)
    }
}
export const deleteHistoryItem = async (id: string) => {
    try {
        const historyItem = await historiesDB.transact(historiesDB.tx.histories[id].delete())
        if (__DEV__) console.log("[deleteHistoryItem] History Item Deleted", historyItem)
        return historyItem.clientId
    } catch (error) {
        if (__DEV__) console.log("[deleteHistoryItem] Error", error)
    }
}


export const updatedHistoryItem = async (id: string) => {
    try {
        const historyItem = await historiesDB.transact(historiesDB.tx.histories[id].update({
            createdAt: new Date(),
        }))
        if (__DEV__) console.log("[updatedHistoryItem] History Item Updated", historyItem)
        return historyItem.clientId
    } catch (error) {
        if (__DEV__) console.log("[updatedHistoryItem] Error", error)
    }
}