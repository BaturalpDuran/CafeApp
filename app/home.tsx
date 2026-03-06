// app/home.tsx
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
import { useTheme } from '../context/ThemeContext'; // Az önce yazdığımız hook
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  // Context'ten tema durumunu ve değiştirme fonksiyonunu alıyoruz
  const { theme, toggleTheme } = useTheme();
  // Tip dönüşümü (Type Casting) ile TypeScript'i rahatlatıyoruz
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sayfa açıldığında kampanyaları getir
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false }); // En yeniler en üstte

    if (error) {
      console.error('Hata:', error);
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  // FlatList'in ekrana basacağı her bir kampanya kartının tasarımı
  const renderCampaign = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentColors.secondary }]}
      onPress={() => router.push(`../campaign/${item.id}`)}
      activeOpacity={0.8} // Tıklanma hissi veren şeffaflık ayarı
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
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
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
  return (
    // SafeAreaView, özellikle iPhone'larda üst çentiğin (notch) altına taşmayı engeller
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* ÜST BİLGİ VE TEMA BUTONU (HEADER) */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Ana Sayfa
        </Text>
        <View style={styles.themeToggleContainer}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: currentColors.primary }}
            thumbColor={'#f4f3f4'}
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

      {/* KAMPANYALAR LİSTESİ */}
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>
          Öne Çıkan Kampanyalar
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={currentColors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={campaigns}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCampaign}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoutButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  card: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden', // Resmin köşelerinin de karta uyup yuvarlanmasını sağlar
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
