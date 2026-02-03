import { APP_ID } from '@/constants/server_url';
import { i, id, init, InstaQLEntity } from '@instantdb/react-native';

const comments = i.schema({
    entities: {
        comments: i.entity({
            id: i.string().unique().indexed(),
            articleId: i.string(),
            creator: i.json(),
            content: i.string(),
            notes: i.number(),
            upvotes: i.json(),
            signals: i.json(),
            created: i.date(),
            modified: i.date(),
        }),
    }
})
type CommentType = InstaQLEntity<typeof comments, 'comments'>


export const db = init({
    appId: APP_ID,
    schema: comments,
})

export const createdComment = async (articleId: string, creator: string, content: string) => {
    try {
        const comment = await db.transact(db.tx.comments[id()].create({
            id: id(),
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