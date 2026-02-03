import { APP_ID } from '@/constants/server_url';
import { i, id, init, InstaQLEntity } from '@instantdb/react-native';

/** 

articleStats: {
    articleId: string,      // Référence unique
    commentCount: number,
    likeCount: number,
    viewCount: number,
    shareCount: number,
    lastCommentAt: number,
    updatedAt: number
  }

*/

const articles = i.schema({
    entities: {
        articlesStats: i.entity({
            articleId: i.string().indexed(),
            commentCount: i.number(),
            likeCount: i.number(),
            viewCount: i.number(),
            shareCount: i.number(),
            lastCommentAt: i.number(),
            updatedAt: i.number(),
        }),
    }
})
type ArticleStatsType = InstaQLEntity<typeof articles, 'articlesStats'>


export const db = init({
    appId: APP_ID,
    schema: articles,
})

export const createdArticleStats = async (articleId: string) => {
    try {
        const articleStats = await db.transact(db.tx.articlesStats[id()].create({
            articleId: articleId,
            commentCount: 0,
            likeCount: 0,
            viewCount: 0,
            shareCount: 0,
            lastCommentAt: 0,
            updatedAt: 0,
        }))

        return articleStats.clientId
    } catch (error) {
        console.log(error)
    }
}