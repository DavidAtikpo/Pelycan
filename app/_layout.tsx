import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen 
        name="AjouterLogementFormScreen" 
        options={{ 
          title: "Ajouter un logement",
          headerShown: true
        }} 
      />
    </Stack>
  );
} 