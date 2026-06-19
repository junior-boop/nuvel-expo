
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { AuthProvider, useAuth } from '@/context/auth.context';
import { DatabaseProvider } from '@/context/database.context';
import * as localStorage from '@/Database/localstorage';
import { cleanupAutoRefresh } from '@/lib/token_system';
import { ReactNode, useCallback, useEffect } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { HeaderStyles } from './styles/cards';

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
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const root = segments[0] as string | undefined;
    const inAuthGroup = root === '(auth)';
    const inOnboardingGroup = root === '(onboarding)';
    const profileIncomplete = !!user && (!user.photo || !user.biography);

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/login' as never);
      return;
    }
    if (profileIncomplete) {
      if (!inOnboardingGroup) router.replace('/profile' as never);
      return;
    }
    if (inAuthGroup || (inOnboardingGroup && (segments[1] as string) !== 'sync')) {
      router.replace('/(tabs)');
    }
  }, [user, isAuthenticated, loading, segments]);

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
        <Stack.Screen name="reader" options={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: "#fff" } }} />
      </Stack>
      </AuthGate>
      <View style={{ height: frame.bottom }} />
    </DatabaseProvider>
    // </ThemeProvider>
  );
}
