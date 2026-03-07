// app/index.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { DatabaseService } from '../services/databaseService';

export default function HomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ZİYARETÇİ KONTROLÜ İÇİN STATE
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchCampaigns();
    checkUser();
  }, []);

  // KULLANICI GİRİŞ YAPMIŞ MI KONTROL ET
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
//test
  const fetchCampaigns = async () => {
    try {
      const data = await DatabaseService.getCampaigns();
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Kampanyalar çekilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ÇIKIŞ YAPMA
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // State'i sıfırla ki buton anında "Giriş"e dönsün
  };

  const renderCampaign = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentColors.secondary }]}
      onPress={() => router.push(`/campaign/${item.id}`)}
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
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Ana Sayfa
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
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>

          {/* KULLANICI VARSA "ÇIKIŞ", YOKSA "GİRİŞ" BUTONU */}
          {user ? (
            <TouchableOpacity
              onPress={handleLogout}
              style={[
                styles.authButton,
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
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={[
                styles.authButton,
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
                Giriş Yap
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  authButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
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
