// app/admin/_layout.tsx
import { Ionicons } from '@expo/vector-icons'; // Expo ile hazır gelen ikon kütüphanesi
import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function AdminTabLayout() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];
  //jdnkajsnds
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Üstteki varsayılan başlık çubuğunu gizler
        tabBarStyle: {
          backgroundColor: currentColors.background,
          borderTopColor: currentColors.secondary,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: currentColors.primary, // Seçili sekmenin rengi
        tabBarInactiveTintColor: '#9BA1A6', // Seçili olmayan sekmenin rengi
      }}
    >
      {/* 1. SEKME: YÖNETİM (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Yönetim',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 2. SEKME: KAMPANYALAR */}
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'Kampanyalar',
          tabBarIcon: ({ color }) => (
            <Ionicons name="megaphone-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 3. SEKME: TARİFLER */}
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Tarifler',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cafe-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
