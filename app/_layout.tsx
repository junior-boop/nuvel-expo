import { DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { View } from '@/components/Themed';
import { DatabaseProvider } from '@/context/database.context';
import { useCallback, useEffect } from 'react';


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
  const prepare = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, []);
  // const { loading } = useAuthDB();

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <View style={HeaderStyles.container}>
  //         <Image source={require("../assets/images/Nuvel.png")} style={HeaderStyles.image} />
  //       </View>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   )
  // }
  return (
    <SafeAreaProvider>
      {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>je suis dans la joie</Text>
      </View> */}
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const frame = useSafeAreaInsets()

  return (
    <ThemeProvider value={DefaultTheme}>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="loginzone" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name='noteeditor' options={{ headerShown: true }} />
          <Stack.Screen name='groupeitems' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
          <Stack.Screen name='searchnotes' options={{ headerShown: true, headerShadowVisible: false, animation: 'fade_from_bottom', headerTitle: '' }} />
          <Stack.Screen name="profils" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "Profils information", contentStyle: { backgroundColor: "#fff" } }} />
          <Stack.Screen name="biblepage" options={{ headerShown: true, headerShadowVisible: false, animation: 'slide_from_right', title: "", contentStyle: { backgroundColor: "#fff" } }} />
          <Stack.Screen name="newarticle" options={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: "#fff" } }} />
          <Stack.Screen name="reader" options={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: "#fff" } }} />
        </Stack>
        <View style={{ height: frame.bottom }} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
