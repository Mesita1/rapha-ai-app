export const Colors = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceBorder: 'rgba(255,255,255,0.06)',
  surfaceLight: '#1a1a28',
  accent: '#0ea87a',
  accentDark: '#0b8a63',
  accentLight: 'rgba(14, 168, 122, 0.15)',
  purple: '#6C5CE7',
  purpleDark: '#5A4BD6',
  purpleLight: 'rgba(108, 92, 231, 0.15)',
  warning: '#ffd93d',
  warningLight: 'rgba(255, 217, 61, 0.15)',
  alert: '#ff6b6b',
  alertLight: 'rgba(255, 107, 107, 0.15)',
  positive: '#00d68f',
  positiveLight: 'rgba(0, 214, 143, 0.15)',
  negative: '#ff6b6b',
  text: '#ffffff',
  textMuted: '#8e8e93',
  textDim: '#5a5a5e',
  white: '#ffffff',
  black: '#000000',
  cardGlass: 'rgba(18, 18, 26, 0.9)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  userBubble: '#6C5CE7',
  aiBubble: '#12121a',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  hero: 72,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  accentGlow: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
