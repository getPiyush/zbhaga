import { Stack } from 'expo-router';

export function AppNavigator() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: '#1F6F5C',
        headerTitleStyle: { fontWeight: '600' as const },
      }}
    >
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="group/[id]" options={{ title: 'Group' }} />
      <Stack.Screen name="expense/[id]" options={{ title: 'Expense' }} />
      <Stack.Screen name="expense/new" options={{ title: 'Add Expense', presentation: 'modal' }} />
      <Stack.Screen name="payment/new" options={{ title: 'Record Payment', presentation: 'modal' }} />
      <Stack.Screen name="settle" options={{ title: 'Settlements', presentation: 'modal' }} />
    </Stack>
  );
}
