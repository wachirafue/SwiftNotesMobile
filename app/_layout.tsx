import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppProvider';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "expo-notifications: Android Push",
]);

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </AppProvider>
  );
}