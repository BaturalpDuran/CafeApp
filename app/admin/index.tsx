// app/admin/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { DatabaseService } from '../../services/databaseService';

export default function UsersManagementScreen() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  // List & Search States
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Role Management States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    // Debounce search to prevent database spam
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getUsers(searchQuery);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user logout and redirects to the public home screen.
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Error', error.message);
    } else {
      router.replace('/' as any);
    }
  };

  /**
   * Opens the role management modal for the selected user.
   */
  const openRoleModal = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  /**
   * Updates the selected user's role and refreshes the list.
   */
  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return;

    setUpdatingRole(true);
    try {
      await DatabaseService.updateUserRole(selectedUser.id, newRole);
      Alert.alert(
        'Success',
        `${selectedUser.first_name}'s role updated to ${newRole.toUpperCase()}`,
      );
      setModalVisible(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list to show the new role
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: currentColors.secondary }]}
      onPress={() => openRoleModal(item)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { color: currentColors.text }]}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={{ color: currentColors.primary, fontWeight: 'bold' }}>
          {item.email}
        </Text>
      </View>
      <View
        style={[
          styles.roleBadge,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text
          style={{
            color: currentColors.text,
            fontSize: 12,
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {item.role}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* HEADER WITH LOGOUT BUTTON */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>
          Users
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
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: currentColors.secondary },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={currentColors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Search by name or email..."
          placeholderTextColor="#9BA1A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* USERS LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={currentColors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text
              style={{
                color: currentColors.text,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              No users found.
            </Text>
          }
        />
      )}

      {/* ROLE MANAGEMENT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentColors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentColors.primary }]}>
              Change User Role
            </Text>
            <Text
              style={{
                color: currentColors.text,
                marginBottom: 20,
                textAlign: 'center',
                opacity: 0.8,
              }}
            >
              Select a new role for {selectedUser?.first_name}{' '}
              {selectedUser?.last_name}
            </Text>

            {updatingRole ? (
              <ActivityIndicator
                size="large"
                color={currentColors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: currentColors.secondary },
                  ]}
                  onPress={() => handleUpdateRole('admin')}
                >
                  <Text
                    style={{ color: currentColors.text, fontWeight: 'bold' }}
                  >
                    👑 Admin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: currentColors.secondary },
                  ]}
                  onPress={() => handleUpdateRole('barista')}
                >
                  <Text
                    style={{ color: currentColors.text, fontWeight: 'bold' }}
                  >
                    ☕ Barista
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: currentColors.secondary },
                  ]}
                  onPress={() => handleUpdateRole('customer')}
                >
                  <Text
                    style={{ color: currentColors.text, fontWeight: 'bold' }}
                  >
                    👤 Customer
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => setModalVisible(false)}
              disabled={updatingRole}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  logoutButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16 },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  roleButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
});
