import ArticlesItems from '@/components/articlesItems';
import PageLayout from '@/components/page';
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Articles } from '@/Database/db';
import * as Session from "@/Database/session";
import { Redirect } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Image } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { HeaderStyles } from '../styles/cards';




export default function TabOneScreen() {
  const [value, onChangeText] = useState('');
  const [store, setStore] = useState<string[] | null>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<Articles[] | null>(null)

  const fetchArticle = useCallback(async () => {
    const req_article = await fetch(`https://nuvelserver.godigital.workers.dev/articles`)
    const res_article = await req_article.json()
    setArticles(res_article)
  }, [])

  useEffect(() => {
    fetchArticle()
    checkSessionStatus()
  }, [])

  const checkSessionStatus = async () => {
    try {
      const session = await Session.get()
      setIsAuthenticated(!!session)

    } catch (error) {
      console.log('Erreur lors de la vérification de la session:', error)
      setIsAuthenticated(false)
    }
  }

  // Si l'état d'authentification est false, rediriger vers la page de login
  if (isAuthenticated === false) {
    return <Redirect href="/login" />;
  }


  return (
    <PageLayout>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={HeaderStyles.container}>
          <Image source={require("../../assets/images/Nuvel.png")} style={HeaderStyles.image} />
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ marginVertical: convert(16) }}>
            <Text style={{ fontSize: convert(20), fontWeight: "bold", paddingHorizontal: convert(16) }}>For You</Text>
          </View>
          <View style={{ gap: convert(32) }}>
            <View style={{ paddingHorizontal: convert(16), gap: convert(12) }}>
              <View>
                <Text style={{ fontSize: convert(28), fontWeight: "bold", width: '90%', marginBottom: convert(8) }}>{articles?.[0].title}</Text>
                <Text style={{ fontSize: convert(16), color: '#444', width: '90%', marginBottom: convert(8) }}>{articles?.[0].description.substring(0, 120)}...</Text>
                <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
                  <View style={{ width: convert(32), height: convert(32), backgroundColor: "#444", borderRadius: convert(16) }} />
                  <Text style={{ fontSize: convert(16), color: "#444" }}>{articles?.[0].topic}</Text>
                  <Text style={{ fontSize: convert(16), color: "#444" }}>- {moment(articles?.[0].createdAt).fromNow()}</Text>
                </View>
              </View>
              <View style={{ width: '100%', aspectRatio: 1, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e2e2ff' }}>
                <Image source={{ uri: `https://${articles?.[2].imageurl}` }} style={{ width: '100%', aspectRatio: 1 }} />
              </View>
            </View>
            {articles?.map((article) => (
              <ArticlesItems key={article.id} article={article} />
            ))}
            <View style={{ height: convert(72) }} />
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </PageLayout>
  );
}

