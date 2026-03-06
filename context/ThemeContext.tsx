// context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// Uygulamanın her yerinden erişebileceğimiz Tema Bağlamı
export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme(); // Cihazın kendi temasını al (dark veya light)

  // Varsayılan olarak cihazın temasını kullanıyoruz
  const [theme, setTheme] = useState(systemTheme || 'light');

  // Butona basıldığında temayı değiştirecek fonksiyon
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Diğer dosyalarda kolayca kullanabilmek için özel bir Hook yazıyoruz
export const useTheme = () => useContext(ThemeContext);
