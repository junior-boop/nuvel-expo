import { id } from '@instantdb/react-native';
import { db } from './instantdb.init';

export const createdArticleStats = async (articleId: string) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id()].create({
            articleId: articleId,
            commentCount: 0,
            likeCount: 0,
            viewCount: 0,
            lastCommentAt: new Date(),
            updatedAt: new Date(),
            shareCount: 0,
            signals: [],
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const setViewCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            viewCount: lastCount + 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const setCommentCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            commentCount: lastCount + 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const removeCommentCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            commentCount: lastCount - 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const updateArticleStats = async (id: string, commentCount: number, likeCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            commentCount: commentCount,
            likeCount: likeCount,
            updatedAt: new Date(),
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const setLikeCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            likeCount: lastCount + 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}


export const removeLikeCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            likeCount: lastCount - 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const checkArticleStats = async (articleId: string) => {
    try {
        const query = {
            articlesStats: {
                $: {
                    where: {
                        articleId: articleId,
                    },
                },
            }
        }
        const data = db.queryOnce(query)

        return data
    } catch (error) {
        console.log(error)
    }
}

export const setShareCount = async (id: string, lastCount: number) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            shareCount: lastCount + 1,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}

export const setSignals = async (id: string, signals: string[]) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].update({
            signals: signals,
            updatedAt: new Date(),
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}


export const deleteArticleStats = async (id: string) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id].delete())
        console.log("[deleteArticleStats] Article Stats Deleted", articleStats)
        return articleStats.clientId
    } catch (error) {
        console.log("[deleteArticleStats] Error", error)
    }
}