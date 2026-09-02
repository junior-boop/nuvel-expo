
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { AuthProvider, useAuth } from '@/context/auth.context';
import { DatabaseProvider, useDatabase } from '@/context/database.context';
import * as localStorage from '@/Database/localstorage';
import { initErrorReporting, reportError } from '@/lib/errorReporter';
import { syncPushTokenWithServer } from '@/lib/notifications';
import { cleanupAutoRefresh } from '@/lib/token_system';
import * as Notifications from 'expo-notifications';
import { ReactNode, useCallback, useEffect } from 'react';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { HeaderStyles } from './styles/cards';

initErrorReporting();

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  useEffect(() => {
    reportError(error, { screen: 'root_layout', level: 'fatal' });
  }, [error]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: convert(24) }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: convert(8), textAlign: 'center' }}>Une erreur est survenue</Text>
      <Text style={{ fontSize: 14, color: '#797979', marginBottom: convert(16), textAlign: 'center' }}>{error.message}</Text>
      <TouchableOpacity onPress={retry} style={{ backgroundColor: '#208AEF', paddingHorizontal: convert(24), paddingVertical: convert(12), borderRadius: convert(8) }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  localStorage.createTable()
  return (
    <AuthProvider>
      <RootLayoutGate />
    </AuthProvider>
  );
}

function RootLayoutGate() {
  const { loading } = useAuth();

  const prepare = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    prepare();
    return () => {
      cleanupAutoRefresh();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ position: 'relative', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={HeaderStyles.container}>
          <Image source={require("../../assets/images/splash-icon.png")} style={{ width: 200, height: 200 }} />
        </View>
        <View style={{ position: 'absolute', bottom: convert(24), left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={'black'} />
        </View>
      </View>
    )
  }
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const { biblemetadatState } = useDatabase();
  const segments = useSegments();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    syncPushTokenWithServer();
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/(tabs)/search' as never);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loading) return;

    const root = segments[0] as string | undefined;
    const inAuthGroup = root === '(auth)';
    const inOnboardingGroup = root === '(onboarding)';
    const onboardingStep = segments[1] as string | undefined;
    const profileIncomplete = !!user && (!user.photo || !user.biography);
    // Case 2 (utilisateur existant) : on verifie l'etat local a chaque lancement — si vide, on
    // renvoie l'utilisateur vers l'etape correspondante meme s'il a deja termine l'onboarding avant.
    const bibleIncomplete = !!user && !profileIncomplete && (biblemetadatState?.count() ?? 0) === 0;
    const languageIncomplete = !!user && !profileIncomplete && !bibleIncomplete && !user.language;

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/login' as never);
      return;
    }
    if (profileIncomplete) {
      if (!inOnboardingGroup) router.replace('/profile' as never);
      return;
    }
    if (bibleIncomplete) {
      if (!(inOnboardingGroup && onboardingStep === 'bible')) router.replace('/bible' as never);
      return;
    }
    if (languageIncomplete) {
      if (!(inOnboardingGroup && onboardingStep === 'language')) router.replace('/language' as never);
      return;
    }
    if (inAuthGroup || (inOnboardingGroup && onboardingStep !== 'sync')) {
      router.replace('/(tabs)');
    }
  }, [user, isAuthenticated, loading, segments, biblemetadatState]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const frame = useSafeAreaInsets()

  return (
    // <ThemeProvider value={DefaultTheme}>
    <DatabaseProvider>
      <AuthGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name='noteeditor' options={{ headerShown: true }} />
        <Stack.Screen name='groupeitems' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
        <Stack.Screen name='searchnotes' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
        <Stack.Screen name="profils" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "Profils information", contentStyle: { backgroundColor: "#fff" } }} />
        <Stack.Screen name="biblepage" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
        <Stack.Screen name="newarticle" options={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: "#fff" } }} />
        <Stack.Screen name="history" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
        <Stack.Screen name="author" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
        <Stack.Screen name="reader" options={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: "#fff" } }} />
      </Stack>
      </AuthGate>
      <View style={{ height: frame.bottom }} />
    </DatabaseProvider>
    // </ThemeProvider>
  );
}
