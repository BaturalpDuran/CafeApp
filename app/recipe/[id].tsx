// app/recipe/[id].tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Tarif detayı çekilirken hata:', error);
      } else {
        setRecipe(data);
      }
      setLoading(false);
    };

    fetchRecipeDetail();
  }, [id]);

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={{ color: currentColors.text }}>Tarif bulunamadı.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: currentColors.primary, fontWeight: 'bold' }}>
            Geri Dön
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            {'< Geri'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.image_url }} style={styles.image} />

        <View
          style={[
            styles.content,
            { backgroundColor: currentColors.background },
          ]}
        >
          <Text style={[styles.title, { color: currentColors.primary }]}>
            {recipe.title}
          </Text>

          <Text
            style={[
              styles.badge,
              {
                backgroundColor: currentColors.primary,
                color: currentColors.background,
              },
            ]}
          >
            Sadece Baristalara Özel
          </Text>

          <Text style={[styles.description, { color: currentColors.text }]}>
            {recipe.details}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  image: { width: '100%', height: 350, resizeMode: 'cover' },
  content: {
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    marginBottom: 20,
  },
  description: { fontSize: 18, lineHeight: 28 },
});
