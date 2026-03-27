import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';

let BlurView: any = null;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  // Web fallback
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.purple,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: FontSize.xs,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 0.5,
          height: 88,
          paddingBottom: 30,
          paddingTop: 10,
          position: 'absolute',
        },
        tabBarBackground: BlurView
          ? () => (
              <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar — accessed via gear icon
        }}
      />
    </Tabs>
  );
}
