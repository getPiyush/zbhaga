import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#1F6F5C',
        headerTitleStyle: { fontWeight: '600' as const },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'zBhaga' }} />
    </Stack>
  );
}
