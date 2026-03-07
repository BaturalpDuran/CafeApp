// app/campaign/[id].tsx

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
import { DatabaseService } from '../../services/databaseService';

export default function CampaignDetailScreen() {
  // URL'den gelen dinamik ID'yi yakalıyoruz
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonksiyonu useEffect'in içine aldık, böylece sadece id'ye bağımlı oldu
    const fetchCampaignDetail = async () => {
      try {
        const data = await DatabaseService.getCampaignById(id);
        setCampaign(data);
      } catch (error: any) {
        console.error('Detay çekilirken hata:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetail();
  }, [id]); // Artık o sarı uyarı çizgisi kaybolacak!

  // Veri yüklenirken ortada dönen ikon gösterelim
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

  // Eğer veri bulunamazsa veya silinmişse patlamamak için güvenlik önlemi
  if (!campaign) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={{ color: currentColors.text }}>Kampanya bulunamadı.</Text>
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
      {/* ÜST KISIM (Geri Butonu) - Resmin üzerine binen tasarım */}
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
        {/* BÜYÜK KAMPANYA RESMİ */}
        <Image source={{ uri: campaign.image_url }} style={styles.image} />

        {/* İÇERİK (Metinler) */}
        <View
          style={[
            styles.content,
            { backgroundColor: currentColors.background },
          ]}
        >
          <Text style={[styles.title, { color: currentColors.primary }]}>
            {campaign.title}
          </Text>

          <Text style={[styles.date, { color: currentColors.text }]}>
            Eklenme: {new Date(campaign.created_at).toLocaleDateString('tr-TR')}
          </Text>

          <Text style={[styles.description, { color: currentColors.text }]}>
            {campaign.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50, // iPhone çentiği (notch) için boşluk
    left: 20,
    zIndex: 10, // Butonun resmin üstünde kalmasını sağlar
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Arka planla karışmaması için yarı saydam siyah
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: 350, // Resmi büyük tutarak iştah açıcı bir UI sağlıyoruz
    resizeMode: 'cover',
  },
  content: {
    padding: 25,
    borderTopLeftRadius: 30, // İçeriği resmin üzerine yuvarlayarak bindiriyoruz
    borderTopRightRadius: 30,
    marginTop: -30, // Yuvarlak hatları resmin üzerine taşırır (Modern UI hilesi)
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 13,
    opacity: 0.5,
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    lineHeight: 28, // Metnin okunabilirliğini artırmak için satır aralığı açıldı
  },
});
