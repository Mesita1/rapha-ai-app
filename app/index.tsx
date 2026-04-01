import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

export default function Index() {
  const { session, isLoading, isOnboarded } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // Not logged in → go to welcome
  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Logged in but not onboarded → go to onboarding
  if (!isOnboarded) {
    return <Redirect href="/(auth)/connect-device" />;
  }

  // Logged in and onboarded → go to main app
  return <Redirect href="/(tabs)" />;
}
