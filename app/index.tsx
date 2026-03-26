import { Redirect } from 'expo-router';

export default function Index() {
  // Root index redirects to the auth welcome screen
  // In production, check auth state here to redirect to (tabs) if logged in
  return <Redirect href="/(auth)/welcome" />;
}
