// app/admin/recipes.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { DatabaseService } from '../../services/databaseService';
import { StorageService } from '../../services/storageService';

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
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getRecipes();
      setRecipes(data || []);
    } catch (error: any) {
      console.error('Tarifler çekilirken hata:', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a record and its associated image from storage.
   */
  const handleDelete = (id: string, title: string, imageUrl: string) => {
    // <-- imageUrl eklendi
    Alert.alert(
      'Delete Confirmation',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Pass the imageUrl to the service layer for storage cleanup
              await DatabaseService.deleteRecipe(id, imageUrl);
              Alert.alert(
                'Success',
                'Item and associated image deleted successfully.',
              );
              fetchRecipes();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };
  /**
   * Requests gallery permissions, opens the image picker,
   * and delegates the upload process to the StorageService.
   */
  const handlePickImage = async () => {
    // Request permission to access the media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'You need to allow gallery access to upload photos.',
      );
      return;
    }

    // Launch the image gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Compress the image to save bandwidth
      base64: true, // Required for Supabase upload
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setIsUploading(true);
        const base64 = result.assets[0].base64;
        const uri = result.assets[0].uri;

        // Extract the file extension from the URI (fallback to 'jpg')
        const extension = uri.split('.').pop() || 'jpg';

        // Call the service layer to handle the upload
        const publicUrl = await StorageService.uploadImage(base64, extension);

        // Auto-fill the URL input field with the returned public URL
        setNewImageUrl(publicUrl);
        Alert.alert('Success', 'Image uploaded successfully!');
      } catch (error: any) {
        Alert.alert('Upload Error', error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleAddRecipe = async () => {
    if (!newTitle || !newDetails || !newImageUrl) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      await DatabaseService.addRecipe(newTitle, newDetails, newImageUrl);
      Alert.alert('Başarılı', 'Yeni tarif eklendi!');
      setModalVisible(false);
      setNewTitle('');
      setNewDetails('');
      setNewImageUrl('');
      fetchRecipes();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setIsSubmitting(false);
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

        {/* DELETE ICON */}
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDelete(item.id, item.title, item.image_url)} // <-- 3. parametreyi ekledik
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

                <Text
                  style={{
                    color: currentColors.text,
                    marginBottom: 5,
                    fontWeight: 'bold',
                  }}
                >
                  Image Source
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: currentColors.text,
                      borderColor: currentColors.secondary,
                    },
                  ]}
                  placeholder="Paste URL or upload from gallery"
                  placeholderTextColor="#9BA1A6"
                  value={newImageUrl}
                  onChangeText={setNewImageUrl}
                  autoCapitalize="none"
                />
                {/* IMAGE PICKER BUTTON - WITH PROPER STYLING */}
                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    {
                      backgroundColor: currentColors.secondary,
                      borderColor: currentColors.primary,
                    },
                  ]}
                  onPress={handlePickImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color={currentColors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.imagePickerText,
                        { color: currentColors.text },
                      ]}
                    >
                      📸 Choose from Gallery
                    </Text>
                  )}
                </TouchableOpacity>

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
  // --- NEW STYLES FOR IMAGE PICKER ---
  imagePickerButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontWeight: 'bold',
    fontSize: 16,
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
