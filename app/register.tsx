// app/register.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../services/databaseService';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const currentColors = Colors[theme as 'light' | 'dark'];

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the user registration process.
   * Validates form, creates user in Supabase Auth, and saves profile data in the database.
   */
  const handleRegister = async () => {
    // 1. Basic Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 2. Sign up the user in Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // 3. Save the additional user profile data in our custom table
        await DatabaseService.createUserProfile(
          authData.user.id,
          email,
          firstName,
          lastName,
        );

        Alert.alert('Success', 'Registration completed successfully!');

        // 4. Redirect the new customer to the home page (Campaigns)
        router.replace('/' as any);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Text style={[styles.title, { color: currentColors.primary }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: currentColors.text }]}>
          Join us to order your favorite coffee.
        </Text>

        {/* Input Fields */}
        <TextInput
          style={[
            styles.input,
            { color: currentColors.text, borderColor: currentColors.secondary },
          ]}
          placeholder="First Name"
          placeholderTextColor="#9BA1A6"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={[
            styles.input,
            { color: currentColors.text, borderColor: currentColors.secondary },
          ]}
          placeholder="Last Name"
          placeholderTextColor="#9BA1A6"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={[
            styles.input,
            { color: currentColors.text, borderColor: currentColors.secondary },
          ]}
          placeholder="Email"
          placeholderTextColor="#9BA1A6"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[
            styles.input,
            { color: currentColors.text, borderColor: currentColors.secondary },
          ]}
          placeholder="Password"
          placeholderTextColor="#9BA1A6"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input,
            { color: currentColors.text, borderColor: currentColors.secondary },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor="#9BA1A6"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            { backgroundColor: currentColors.primary },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={currentColors.background} />
          ) : (
            <Text
              style={[
                styles.registerButtonText,
                { color: currentColors.background },
              ]}
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Navigate back to Login */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={{ color: currentColors.text }}>
            Already have an account?{' '}
            <Text style={{ color: currentColors.primary, fontWeight: 'bold' }}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: { fontSize: 18, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
});
