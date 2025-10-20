import PageLayout from '@/components/page';
import { View } from '@/components/Themed';
import * as Session from "@/Database/session";
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { HeaderStyles } from '../styles/cards';




export default function TabOneScreen() {
  const [value, onChangeText] = useState('');
  const [store, setStore] = useState<string[] | null>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
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
      <View style={HeaderStyles.container}>
        <Image source={require("../../assets/images/Nuvel.png")} style={HeaderStyles.image} />
      </View>
    </PageLayout>
  );
}

