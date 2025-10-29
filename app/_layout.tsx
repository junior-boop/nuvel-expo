import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { DatabaseProvider } from '@/context/database.context';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [session, setSession] = useState<Partial<Session> | null>(null)


  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }


  // if (session) {
  //   Redirect('login')
  // }


  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const frame = useSafeAreaInsets()

  console.log(frame)

  return (
    <ThemeProvider value={DefaultTheme}>
      <DatabaseProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name='noteeditor' options={{ headerShown: true }} />
          <Stack.Screen name='groupeitems' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
          <Stack.Screen name="login" options={{ headerShown: false, contentStyle: { backgroundColor: "#fff" } }} />
          <Stack.Screen name="profils" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
          <Stack.Screen name="biblepage" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
        </Stack>
        <View style={{ height: frame.bottom }} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
