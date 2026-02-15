import { id } from '@instantdb/react-native';
import { db } from './instantdb.init';


export const createdComment = async (articleId: string, creator: string, content: string) => {
    try {
        // Générer un seul ID pour éviter les duplications
        const commentId = id();

        const comment = await db.transact(db.tx.comments[commentId].create({
            id: commentId,
            articleId: articleId,
            creator: creator,
            content: content,
            notes: 0,
            upvotes: [],
            signals: [],
            created: new Date(),
            modified: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}


export const addupvote = async (commentId: string, upvotes: string[], notes: number) => {
    try {
        const comment = await db.transact(db.tx.comments[commentId].update({
            upvotes: upvotes,
            notes: notes,
            modified: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}

export const removeupvote = async (commentId: string, upvotes: string[], notes: number) => {
    try {
        const comment = await db.transact(db.tx.comments[commentId].update({
            upvotes: upvotes,
            notes: notes - 1,
            modified: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}

export const addsignal = async (commentId: string, signal: string[]) => {
    try {
        const comment = await db.transact(db.tx.comments[commentId].update({
            signals: signal,
            modified: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}

export const updateComment = async (commentId: string, content: string) => {
    try {
        const comment = await db.transact(db.tx.comments[commentId].update({
            content: content,
            modified: new Date(),
        }))

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}


export const deleteComment = async (commentId: string) => {
    try {
        const comment = await db.transact(db.tx.comments[commentId].delete())

        return comment.clientId
    } catch (error) {
        console.log(error)
    }
}

export const getComments = async (articleId: string) => {
    try {
        const query = {
            comments: {
                $: {
                    where: {
                        articleId: articleId,
                    },
                    order: {
                        serverCreatedAt: 'desc' as const,
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
