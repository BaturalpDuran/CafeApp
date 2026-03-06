// src/lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Supabase'in React Native'de düzgün çalışması için zorunlu yama

// Supabase panelinden kopyaladığın bilgileri buraya yapıştır
const supabaseUrl = 'https://azbdrtvwvjiubdwxaozl.supabase.co';
const supabaseAnonKey = 'sb_publishable_hpCLX6mrvVc9dODH-L4w7w_5X9Bmi-e';

// Supabase istemcisini oluşturuyoruz.
// AsyncStorage sayeside kullanıcı uygulamayı kapatsa bile girişi hatırlanacak.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
