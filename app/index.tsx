import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';

export default function Index() {
  const { isLoggedIn, isOnboarded, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (isLoggedIn && isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  if (isLoggedIn && !isOnboarded) {
    return <Redirect href="/(auth)/connect-device" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
