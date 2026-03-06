// app/recipes.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

export default function RecipesScreen() {
  const { theme, toggleTheme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Tarifler çekilirken hata:', error);
      } else {
        setRecipes(data || []);
      }
      setLoading(false);
    };

    fetchRecipes();
  }, []);

  // ÇIKIŞ YAPMA FONKSİYONU
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Çıkış Hatası', error.message);
    } else {
      // Çıkış başarılıysa Login ekranına (index) geri şutla
      router.replace('/');
    }
  };

  const renderRecipe = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentColors.secondary }]}
      onPress={() => router.push(`../recipe/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: currentColors.primary }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.cardDescription, { color: currentColors.text }]}
          numberOfLines={2}
        >
          {item.details}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* ÜST BİLGİ, TEMA VE ÇIKIŞ BUTONU */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Kahve Tarifleri
        </Text>

        <View style={styles.headerRight}>
          <View style={styles.themeToggleContainer}>
            <Text style={{ fontSize: 16, marginRight: 5 }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: currentColors.primary }}
              thumbColor={'#f4f3f4'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Switch'i biraz küçülttük
            />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={[
              styles.logoutButton,
              { backgroundColor: currentColors.primary },
            ]}
          >
            <Text
              style={{
                color: currentColors.background,
                fontWeight: 'bold',
                fontSize: 12,
              }}
            >
              Çıkış
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TARİFLER LİSTESİ */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={currentColors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipe}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  logoutButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  card: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: '100%', height: 180, resizeMode: 'cover' },
  cardContent: { padding: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDescription: { fontSize: 14, opacity: 0.8, lineHeight: 20 },
});
