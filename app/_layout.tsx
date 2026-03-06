// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    // Kendi yazdığımız Tema sağlayıcımızla tüm uygulamayı sarmalıyoruz
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Sayfalarımızı buraya tanıtıyoruz ki Expo Router yollarını bilsin */}
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="recipes" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
