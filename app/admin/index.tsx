// app/admin/index.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sayfa açıldığında kullanıcıları getir
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kullanıcılar çekilirken hata:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // 1. DÜZENLE BUTONUNA BASILINCA AÇILAN MENÜ
  const handleRoleChange = (
    userId: string,
    currentRole: string,
    email: string,
  ) => {
    Alert.alert(
      'Kullanıcı Yetkisi',
      `${email} isimli kullanıcının rolünü değiştiriyorsunuz. (Mevcut: ${currentRole.toUpperCase()})`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Müşteri Yap', onPress: () => updateRole(userId, 'customer') },
        { text: 'Barista Yap', onPress: () => updateRole(userId, 'barista') },
        { text: 'Admin Yap', onPress: () => updateRole(userId, 'admin') },
      ],
    );
  };

  // 2. SEÇİLEN YENİ ROLÜ VERİTABANINA YAZMA
  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Kullanıcı yetkisi anında güncellendi.');
      fetchUsers(); // Listeyi otomatik yenileyip ekrana yeni halini basıyoruz
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  // EKRANA BASILACAK HER BİR KULLANICI KARTI
  const renderUser = ({ item }: { item: any }) => (
    <View
      style={[styles.userCard, { backgroundColor: currentColors.secondary }]}
    >
      <View style={styles.userInfo}>
        <Text style={[styles.userEmail, { color: currentColors.text }]}>
          {item.email || `Bilinmeyen Kullanıcı`}
        </Text>
        <Text style={[styles.userRole, { color: currentColors.primary }]}>
          Rol: {item.role.toUpperCase()}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: currentColors.primary }]}
        onPress={() => handleRoleChange(item.id, item.role, item.email)}
      >
        <Text
          style={{
            color: currentColors.background,
            fontWeight: 'bold',
            fontSize: 13,
          }}
        >
          Düzenle
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* ÜST BİLGİ VE ÇIKIŞ BUTONU */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          Kullanıcı Yönetimi
        </Text>
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

      {/* KULLANICI LİSTESİ */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={currentColors.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
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
    paddingBottom: 15,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  content: { flex: 1, paddingHorizontal: 20 },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userInfo: { flex: 1 },
  userEmail: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  userRole: { fontSize: 13, fontWeight: 'bold', opacity: 0.8 },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
});
