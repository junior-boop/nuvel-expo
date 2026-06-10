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
        })
    }
})
export type CommentType = InstaQLEntity<typeof schema, 'comments'>
export type ArticleStatsType = InstaQLEntity<typeof schema, 'articlesStats'>
export type AppreciationType = InstaQLEntity<typeof schema, 'appreciation'>

// Initialisation avec le storage personnalisé pour React Native
// Cela remplace IndexedDB par SQLite via notre ReactNativeStorage
const storage = new ReactNativeStorage();

export const db = init({
    appId: APP_ID,
    schema,
    devtool: true,
})