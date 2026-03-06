// app/admin/recipes.tsx
import { Ionicons } from '@expo/vector-icons';
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

export default function AdminRecipesScreen() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State'leri
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState(''); // recipes tablosunda description yerine details kullanmıştık
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Tarifler çekilirken hata:', error);
    else setRecipes(data || []);

    setLoading(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Silme Onayı',
      `"${title}" adlı tarifi silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('recipes')
              .delete()
              .eq('id', id);
            if (error) Alert.alert('Hata', error.message);
            else {
              Alert.alert('Başarılı', 'Tarif silindi.');
              fetchRecipes();
            }
          },
        },
      ],
    );
  };

  const handleAddRecipe = async () => {
    if (!newTitle || !newDetails || !newImageUrl) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('recipes')
      .insert([
        { title: newTitle, details: newDetails, image_url: newImageUrl },
      ]);
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Yeni tarif eklendi!');
      setModalVisible(false);
      setNewTitle('');
      setNewDetails('');
      setNewImageUrl('');
      fetchRecipes();
    }
  };

  const renderRecipe = ({ item }: { item: any }) => (
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
            {item.details}
          </Text>
        </View>

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
          Tarif Yönetimi
        </Text>
      </View>

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
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>

      {/* YÜZEN BUTON (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentColors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={currentColors.background} />
      </TouchableOpacity>

      {/* YENİ EKLEME MODALI */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
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
                  Yeni Tarif Ekle
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentColors.text,
                      borderColor: currentColors.secondary,
                    },
                  ]}
                  placeholder="Tarif Başlığı (Örn: Iced Latte)"
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
                  placeholder="Tarif Detayları ve Hazırlanışı"
                  placeholderTextColor="#9BA1A6"
                  value={newDetails}
                  onChangeText={setNewDetails}
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
                    onPress={handleAddRecipe}
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
