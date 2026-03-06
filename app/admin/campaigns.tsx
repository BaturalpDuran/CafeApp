// app/admin/campaigns.tsx
import { Ionicons } from '@expo/vector-icons'; // İkonlar için
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function AdminCampaignsScreen() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal (Yeni Ekleme Penceresi) State'leri
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // 1. KAMPANYALARI GETİR (READ)
  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Kampanyalar çekilirken hata:', error);
    else setCampaigns(data || []);

    setLoading(false);
  };

  // 2. KAMPANYA SİL (DELETE)
  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Silme Onayı',
      `"${title}" adlı kampanyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('campaigns')
              .delete()
              .eq('id', id);
            if (error) Alert.alert('Hata', error.message);
            else {
              Alert.alert('Başarılı', 'Kampanya silindi.');
              fetchCampaigns(); // Listeyi yenile
            }
          },
        },
      ],
    );
  };

  // 3. YENİ KAMPANYA EKLE (CREATE)
  const handleAddCampaign = async () => {
    if (!newTitle || !newDescription || !newImageUrl) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('campaigns').insert([
      {
        title: newTitle,
        description: newDescription,
        image_url: newImageUrl,
      },
    ]);
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Yeni kampanya eklendi!');
      setModalVisible(false); // Modalı kapat
      setNewTitle(''); // Formu temizle
      setNewDescription('');
      setNewImageUrl('');
      fetchCampaigns(); // Listeyi yenile
    }
  };

  // LİSTEDEKİ HER BİR KAMPANYA KARTI
  const renderCampaign = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: currentColors.secondary }]}>
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
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

        {/* Çöp Kutusu (Silme) Butonu */}
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          Kampanya Yönetimi
        </Text>
      </View>

      {/* KAMPANYA LİSTESİ */}
      <View style={styles.content}>
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
            contentContainerStyle={{ paddingBottom: 80 }} // Yüzen butonun altında kalmaması için
          />
        )}
      </View>

      {/* YÜZEN BUTON (FLOATING ACTION BUTTON - FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentColors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={currentColors.background} />
      </TouchableOpacity>

      {/* YENİ EKLEME MODALI */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        {/* Boşluğa tıklayınca klavyeyi kapatmak için */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            {/* KLAVYEDEN KAÇINAN SİHİRLİ BİLEŞEN */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%' }}
            >
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: currentColors.background },
                ]}
              >
                <Text
                  style={[styles.modalTitle, { color: currentColors.primary }]}
                >
                  Yeni Kampanya Ekle
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentColors.text,
                      borderColor: currentColors.secondary,
                    },
                  ]}
                  placeholder="Kampanya Başlığı"
                  placeholderTextColor="#9BA1A6"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      color: currentColors.text,
                      borderColor: currentColors.secondary,
                    },
                  ]}
                  placeholder="Açıklama"
                  placeholderTextColor="#9BA1A6"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={4}
                />

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentColors.text,
                      borderColor: currentColors.secondary,
                    },
                  ]}
                  placeholder="Resim URL (Unsplash vb.)"
                  placeholderTextColor="#9BA1A6"
                  value={newImageUrl}
                  onChangeText={setNewImageUrl}
                  autoCapitalize="none"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: currentColors.secondary },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={{ color: currentColors.text, fontWeight: 'bold' }}
                    >
                      İptal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: currentColors.primary },
                    ]}
                    onPress={handleAddCampaign}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={currentColors.background} />
                    ) : (
                      <Text
                        style={{
                          color: currentColors.background,
                          fontWeight: 'bold',
                        }}
                      >
                        Kaydet
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  cardContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDescription: { fontSize: 13, opacity: 0.8 },
  deleteIcon: { padding: 10, marginLeft: 10 },

  // Yüzen Buton (FAB) Stilleri
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
