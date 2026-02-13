import ArticlesItems from '@/components/articlesItems';
import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
// import { convert } from '@/constants/convert';
import { useArticlesAll } from '@/lib/useArticlesAll';
// import moment from 'moment';
import { convert } from '@/constants/convert';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { Image } from 'react-native';
import { GestureHandlerRootView, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { HeaderStyles } from '../styles/cards';




export default function TabOneScreen() {
  // Utilisation du hook personnalisé
  const { articles, loading, error } = useArticlesAll();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <PageLayout_3 addnote>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} size={"default"} />} >
          <View style={HeaderStyles.container}>
            <Image source={require("../../assets/images/Nuvel.png")} style={HeaderStyles.image} />
          </View>

          <>
            <View style={{ marginVertical: convert(16) }}>
              <Text style={{ fontSize: convert(20), fontWeight: "bold", paddingHorizontal: convert(16) }}>For You</Text>
            </View>
            <View style={{ gap: convert(42) }}>
              {articles.length > 0 && (<View style={{ paddingHorizontal: convert(16), gap: convert(12) }}>
                <View>
                  <Text style={{ fontSize: convert(28), fontWeight: "bold", width: '90%', marginBottom: convert(8) }}>{articles[0].title}</Text>
                  <Text style={{ fontSize: convert(16), color: '#444', width: '90%', marginBottom: convert(8) }}>{articles[0].description.substring(0, 120)}...</Text>
                  <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
                    <View style={{ width: convert(32), height: convert(32), backgroundColor: "#444", borderRadius: convert(16), overflow: 'hidden' }}><Image source={{ uri: `https://${articles[0].user.photo}` }} style={{ width: '100%', aspectRatio: 1 }} /></View>
                    <Text style={{ fontSize: convert(16), color: "#444" }}>{articles[0].topic}</Text>
                    <Text style={{ fontSize: convert(16), color: "#444" }}>- {moment(articles[0].createdAt).fromNow()}</Text>
                  </View>
                </View>
                <View style={{ width: '100%', aspectRatio: 1, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e2e2ff' }}>
                  <Image source={{ uri: `https://${articles[2].imageurl}` }} style={{ width: '100%', aspectRatio: 1 }} />
                </View>
              </View>)}
              {articles?.map((article) => <ArticlesItems key={article.id} article={article} />)}
              <View style={{ height: convert(72) }} />
            </View>
          </>


        </ScrollView>
      </GestureHandlerRootView>
    </PageLayout_3>
  );
}

// TODO: Add loading and error states
//  loading
//               ? (
//                 <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                   <ActivityIndicator size="large" color="#0083ff" />
//                   <Text style={{ marginTop: convert(16), color: '#666' }}>Loading articles...</Text>
//                 </View>
//               ) : error
//                 ? (
//                   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: convert(24) }}>
//                     <Text style={{ fontSize: convert(18), color: 'red', textAlign: 'center', marginBottom: convert(16) }}>
//                       Error loading articles
//                     </Text>
//                     <Text style={{ fontSize: convert(14), color: '#666', textAlign: 'center' }}>
//                       {error}
//                     </Text>
//                   </View>
//                 ) : !articles || articles.length === 0
//                   ? (
//                     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                       <Text style={{ fontSize: convert(18), color: '#666' }}>No articles available</Text>
//                     </View>
//                   ) : (