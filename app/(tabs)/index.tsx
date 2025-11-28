import ArticlesItems from '@/components/articlesItems';
import PageLayout from '@/components/page';
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { Articles } from '@/Database/db';
import * as Session from "@/Database/session";
import { Redirect } from 'expo-router';
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
            {articles?.map((article) => (
              <ArticlesItems key={article.id} article={article} />
            ))}
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </PageLayout>
  );
}

