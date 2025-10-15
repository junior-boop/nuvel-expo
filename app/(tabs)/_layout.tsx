import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65,
          borderTopColor: "#eee",
          borderTopWidth: 1,
          elevation: 0, // Pour Android
          shadowOpacity: 0, // Pour iOS
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },

      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused, size }) => {
            return <MaterialIcons name="home-filled" size={size} color={color} />
          },
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialIcons
                    name="info"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, focused, size }) => <MaterialIcons name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="myspace"
        options={{
          tabBarIcon: ({ color, focused, size }) => <MaterialIcons name="space-dashboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused, size }) => <MaterialIcons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) => <MaterialIcons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
