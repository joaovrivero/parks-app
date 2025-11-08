/**
 * Design System Constants
 * Centralized theme values for consistent styling across the app
 */

export const colors = {
  // Brand Colors
  brand: {
    50: '#e6faf3',
    100: '#b3f0d9',
    200: '#80e6bf',
    400: '#35B385',
    500: '#1DDD96',
    600: '#3F896E',
  },
  // Dark Colors (for text, backgrounds)
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Semantic Colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const gradients = {
  brandLight: ['#e6faf3', '#b3f0d9', '#f8fafc'],
  brandTeal: ['#1DDD96', '#35B385'],
  brandTealVertical: ['rgba(29, 221, 150, 0.1)', 'rgba(29, 221, 150, 0.05)'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  brand: {
    shadowColor: colors.brand[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const layout = {
  tabBarHeight: 85,
  tabBarPadding: 24,
  headerHeight: 60,
  contentPadding: 16,
};

export default {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  layout,
};
