import { Platform } from 'react-native';

// Tab bar ve seçili ikonlar için ana rengimizi (Acı Kahve) veriyoruz
const tintColorLight = '#4E342E';
const tintColorDark = '#5D4037';

export const Colors = {
  light: {
    text: '#1C1C1C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#4E342E', // Bizim eklediğimiz kahve tonu
    secondary: '#D7CCC8', // Bizim eklediğimiz açık kahve tonu
  },
  dark: {
    text: '#F5F5F5',
    background: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#5D4037', // Bizim eklediğimiz dark kahve tonu
    secondary: '#272727', // Bizim eklediğimiz dark arka plan tonu
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
