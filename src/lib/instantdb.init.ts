import { APP_ID } from '@/constants/server_url';
import { i, init, InstaQLEntity } from '@instantdb/react-native';
import { ReactNativeStorage } from './instantdb.storage';

const schema = i.schema({
    entities: {
        comments: i.entity({
            id: i.string().unique().indexed(),
            articleId: i.string(),
            creator: i.json(),
            content: i.string(),
            notes: i.number(),
            upvotes: i.json(),
            signals: i.json(),
            created: i.date().indexed(),
            modified: i.date().indexed(),
        }),
        articlesStats: i.entity({
            articleId: i.string().indexed(),
            commentCount: i.number(),
            likeCount: i.number(),
            viewCount: i.number(),
            lastCommentAt: i.date(),
            updatedAt: i.date(),
            shareCount: i.number(),
            signals: i.json(),
        }),
        appreciation: i.entity({
            id: i.string().unique().indexed(),
            articleId: i.string(),
            userId: i.string(),
        }),
        notifications: i.entity({
            id: i.string().unique().indexed(),
            recipientUserId: i.string().indexed(),
            type: i.string().indexed(),
            title: i.string(),
            body: i.string(),
            data: i.json(),
            read: i.boolean().indexed(),
            actorUserId: i.string().optional(),
            articleId: i.string().optional(),
            commentId: i.string().optional(),
            createdAt: i.date().indexed(),
        }),
    }
})
export type CommentType = InstaQLEntity<typeof schema, 'comments'>
export type ArticleStatsType = InstaQLEntity<typeof schema, 'articlesStats'>
export type AppreciationType = InstaQLEntity<typeof schema, 'appreciation'>
export type NotificationType = InstaQLEntity<typeof schema, 'notifications'>

// Initialisation avec le storage personnalisé pour React Native
// Cela remplace IndexedDB par SQLite via notre ReactNativeStorage
const storage = new ReactNativeStorage();

export const db = init({
    appId: APP_ID,
    schema,
    devtool: true,
})