import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/components/useColorScheme';


import { FluentBookmark32Filled, FluentBookmark32Regular, FluentDocumentFolder32Filled, FluentDocumentFolder32Regular, FluentHome32Filled, FluentHome32Regular, FluentSearch32Filled, FluentSettings32Filled, FluentSettings32Regular } from '@/constants/icons';



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
          height: 60,
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
            return (!focused ? <FluentHome32Regular width={size} height={size} color={color} /> : <FluentHome32Filled width={size} height={size} color={color} />)
          }

        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, focused, size }) => (focused ? <FluentBookmark32Filled width={size} height={size} color={color} /> : <FluentBookmark32Regular width={size} height={size} color={color} />),
        }}
      />
      <Tabs.Screen
        name="myspace"
        options={{
          tabBarIcon: ({ color, focused, size }) => (focused ? <FluentDocumentFolder32Filled width={size} height={size} color={color} /> : <FluentDocumentFolder32Regular width={size} height={size} color={color} />),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused, size }) => <FluentSearch32Filled width={size} height={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) => (focused ? <FluentSettings32Filled width={size} height={size} color={color} /> : <FluentSettings32Regular width={size} height={size} color={color} />),
        }}
      />
    </Tabs>
  );
}
