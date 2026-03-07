// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Sayfalarımızın YENİ isimlerini buraya tanıtıyoruz */}
        <Stack.Screen name="index" />{' '}
        {/* Artık ana sayfamız (Kampanyalar) bu */}
        <Stack.Screen name="login" /> {/* Giriş ekranımız bu oldu */}
        <Stack.Screen name="admin" />
        <Stack.Screen name="recipes" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
