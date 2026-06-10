import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
// import { convert } from '@/constants/convert';
import { ArticleStat, useArticlesAll } from '@/lib/useArticlesAll';
// import moment from 'moment';
import ArticlesItems from '@/components/articlesItems';
import { convert } from '@/constants/convert';
import { createdHistoryItem } from '@/lib/instantdb.histories';
import { router } from 'expo-router';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { HeaderStyles } from '../styles/cards';





export default function TabOneScreen() {
  // Utilisation du hook personnalisé
  const { articles, loading, error, refresh } = useArticlesAll();
  const [refreshing, setRefreshing] = useState(false);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh().then(() => {
      setRefreshing(false);
    })

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);



  return (
    <PageLayout_3 addnote>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} size={"default"} />} >
          <View style={HeaderStyles.container}>
            <Image source={require("../../../assets/images/Nuvel.png")} style={HeaderStyles.image} />
          </View>

          <>
            <View style={{ marginVertical: convert(16) }}>
              <Text style={{ fontSize: convert(20), fontWeight: "bold", paddingHorizontal: convert(16) }}>For You</Text>
            </View>
            <View style={{ gap: convert(42) }}>
              {articles?.map((article, key) => {
                console.log(key)
                if (key === 0) {
                  return <TopArticles key={article.id} articles={article} />
                } else {
                  if (article.article === null) return null;
                  return <ArticlesItems key={article.id} article={article} />

                }
              })}
              <View style={{ height: convert(72) }} />
            </View>
          </>


        </ScrollView>
      </GestureHandlerRootView>
    </PageLayout_3>
  );
}



const TopArticles = ({ articles }: { articles: ArticleStat }) => {
  const addToHistory = useCallback(async () => {
    const addHistory = await createdHistoryItem(articles.articleId, articles.article?.userid as string, { title: articles.article?.title as string, image: articles.article?.imageurl as string, createdAt: articles.article?.createdAt });
    console.log(addHistory)
  }, [])

  console.log("top article", articles.viewCount)

  const handleOpen = async () => {
    addToHistory()
    router.navigate({
      pathname: '/reader',
      params: {
        element: JSON.stringify(articles)
      }
    })


  }

  return (<TouchableOpacity onPress={handleOpen} style={{ paddingHorizontal: convert(16), gap: convert(12) }}>
    <View>
      <Text style={{ fontSize: convert(28), fontWeight: "bold", width: '90%', marginBottom: convert(8) }}>{articles.article?.title}</Text>
      <Text style={{ fontSize: convert(16), color: '#444', width: '90%', marginBottom: convert(8) }}>{articles.article?.description.substring(0, 120)}...</Text>
      <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
        <View style={{ width: convert(32), height: convert(32), backgroundColor: "#444", borderRadius: convert(16), overflow: 'hidden' }}><Image source={{ uri: `https://${articles.article?.user?.photo}` }} style={{ width: '100%', aspectRatio: 1 }} /></View>
        <View style={{ flexDirection: 'column', gap: convert(2) }}>
          <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
            <Text style={{ fontSize: convert(13), color: "#444", fontWeight: "bold", marginBottom: convert(-3) }}>{articles.article?.user?.name} {articles.article?.user?.first_name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: convert(3), alignItems: 'center' }}>
            <Text style={{ fontSize: convert(13), color: "#444", fontWeight: "bold", marginBottom: convert(0) }}>{articles.viewCount} Reads</Text>
            <Text style={{ fontSize: convert(13), color: "#444" }}>• {moment(articles.article?.createdAt).fromNow()}</Text>
          </View>
        </View>
      </View>
    </View>
    <View style={{ width: '100%', aspectRatio: 5 / 4, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e2e2ff', borderRadius: convert(7) }}>
      <Image source={{ uri: `https://${articles.article?.imageurl}` }} style={{ width: '100%', aspectRatio: 5 / 4 }} />
    </View>
  </TouchableOpacity>)

}