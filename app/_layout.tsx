import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { DatabaseProvider } from '@/context/database.context';

import * as AiStore from "@/Database/ai";
import * as Groups from "@/Database/groups";
import * as Notes from "@/Database/notes";
import * as Session from "@/Database/session";
import * as Sync from '@/Database/sync_event';
import * as Users from "@/Database/users";

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const initialisationDatabase = useCallback(async () => {
    await Sync.createEvent()
    await Users.createTable()
    await Groups.createtable()
    await Notes.createdtable()
    await Session.createTable()
    await AiStore.createTable()
  }, [])

  useEffect(() => {
    initialisationDatabase()
  }, [])

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



  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <DatabaseProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name='noteeditor' options={{ headerShown: true }} />
          <Stack.Screen name='groupeitems' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
          <Stack.Screen name="login" options={{ headerShown: false, contentStyle: { backgroundColor: "#fff" } }} />
        </Stack>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
