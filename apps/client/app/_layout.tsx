import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { AppNavigator } from '../src/navigation/AppNavigator';

function RootStack() {
  const { user, initialising } = useAuth();

  if (initialising) {
    return (
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
