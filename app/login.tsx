// app/login.tsx

import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../constants/theme'; // Kendi renk paletimiz
import { supabase } from '../lib/supabase'; // Kurduğumuz veritabanı bağlantısı

export default function LoginScreen() {
  // 1. DURUM (STATE) YÖNETİMİ
  // Kullanıcının girdiği e-posta, şifre ve butona basıldığındaki "yükleniyor" durumunu burada tutuyoruz.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. TEMA (DARK/LIGHT MODE) YÖNETİMİ
  // Cihazın temasını dinliyoruz. 'dark' veya 'light' döner.
  const theme = useColorScheme() ?? 'light';
  const currentColors = Colors[theme]; // theme.ts dosyasından ilgili renkleri çekiyoruz.

  // 3. GİRİŞ YAPMA FONKSİYONU
  // Butona basıldığında tetiklenen asenkron fonksiyon
  // 3. GİRİŞ YAPMA VE ROL BAZLI YÖNLENDİRME FONKSİYONU
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);

    // 1. Aşama: Kimlik Doğrulama (Auth)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      setLoading(false);
      Alert.alert('Giriş Başarısız', authError.message);
      return; // Hata varsa burada durdur
    }

    // 2. Aşama: Veritabanından Rolü Çekme
    // Giriş yapan kullanıcının ID'sini alıyoruz
    const userId = authData.user?.id;

    if (userId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single(); // Sadece tek bir satır döneceğini biliyoruz

      setLoading(false); // Tüm işlemler bitti, loadingi kapat

      if (profileError || !profileData) {
        Alert.alert('Hata', 'Kullanıcı profili bulunamadı.');
        return;
      }

      const userRole = profileData.role;

      // 3. Aşama: Role Göre Router ile Fırlatma
      if (userRole === 'admin') {
        router.replace('/admin');
      } else if (userRole === 'barista') {
        router.replace('/recipes');
      } else {
        // Müşteriyi ana sayfaya (kampanyalara) geri yolla
        router.replace('/');
      }
    }
  };

  // 4. ARAYÜZ (UI) RENDER EDİLMESİ
  // React Native'de div yerine View, p/h1 yerine Text kullanılır.
  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      {/* BAŞLIK KISMI */}
      <Text style={[styles.title, { color: currentColors.primary }]}>
        CafeApp
      </Text>
      <Text style={[styles.subtitle, { color: currentColors.text }]}>
        Hoş Geldiniz, lütfen giriş yapın
      </Text>

      {/* E-POSTA INPUT ALANI */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentColors.secondary, // Arka plan açık veya koyu kahve
            color: currentColors.text, // Yazı rengi
            borderColor: currentColors.primary, // Çerçeve rengi (Acı kahve)
          },
        ]}
        placeholder="E-posta adresiniz"
        placeholderTextColor={theme === 'dark' ? '#9BA1A6' : '#687076'} // Tema uyumlu placeholder
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none" // E-posta yazarken ilk harfi otomatik büyütmesin
        keyboardType="email-address" // Klavyede @ işareti hazır gelsin
      />

      {/* ŞİFRE INPUT ALANI */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: currentColors.secondary,
            color: currentColors.text,
            borderColor: currentColors.primary,
          },
        ]}
        placeholder="Şifreniz"
        placeholderTextColor={theme === 'dark' ? '#9BA1A6' : '#687076'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Şifreyi noktalı/yıldızlı (gizli) gösterir
      />

      {/* GİRİŞ BUTONU */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: currentColors.primary }]}
        onPress={handleLogin}
        disabled={loading} // Yüklenme sırasındaysa butonu kilitle ki üst üste basılmasın
      >
        {/* Loading true ise dönen ikon, false ise "Giriş Yap" yazısı gösterilir */}
        {loading ? (
          <ActivityIndicator color={currentColors.background} />
        ) : (
          <Text
            style={[styles.buttonText, { color: currentColors.background }]}
          >
            Giriş Yap
          </Text>
        )}
      </TouchableOpacity>
      {/* LINK TO REGISTER SCREEN */}
      <TouchableOpacity
        style={{ marginTop: 20, alignItems: 'center' }}
        onPress={() => router.push('/register')}
      >
        <Text style={{ color: currentColors.text }}>
          Don&apost have an account?
          <Text style={{ color: currentColors.primary, fontWeight: 'bold' }}>
            Sign Up
          </Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 20, alignItems: 'center' }}
        onPress={() => router.back()} // Geri dön
      >
        <Text style={{ color: currentColors.primary, fontWeight: 'bold' }}>
          Misafir Olarak Devam Et
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 5. STİL (CSS) TANIMLAMALARI
// Burası CSS'in React Nativecesidir. Flexbox mantığıyla çalışır.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ekranın tamamını kapla
    justifyContent: 'center', // Elemanları dikey eksende ortala
    padding: 20, // Ekranın kenarlarından 20 birim boşluk bırak
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  input: {
    height: 55, // Input alanının yüksekliği
    borderWidth: 1, // 1 piksellik çerçeve
    borderRadius: 12, // Köşeleri modern bir şekilde yuvarlat
    paddingHorizontal: 15, // Yazı içeriden çok bitişik olmasın diye sağdan/soldan boşluk
    marginBottom: 15, // Altındaki elemanla arasındaki boşluk
    fontSize: 16,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center', // İçindeki metni dikey ortala
    alignItems: 'center', // İçindeki metni yatay ortala
    marginTop: 10,
    // Aşağıdakiler iOS ve Android için butona ufak bir derinlik (gölge) katar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
