// Sistema de Diseño Latti - Constantes de UI
export const COLORS = {
  // Colores principales
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Color principal
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Colores secundarios
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Colores de estado
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Colores especiales
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['TransformaSans_Trial-Bold', 'Inter', 'system-ui', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Variantes de botones estandarizadas
export const BUTTON_VARIANTS = {
  primary: {
    base: 'bg-blue-600 text-white border-transparent',
    hover: 'hover:bg-blue-700',
    focus: 'focus:ring-blue-500',
    disabled: 'disabled:bg-blue-300 disabled:cursor-not-allowed',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-900 border-gray-300',
    hover: 'hover:bg-gray-200',
    focus: 'focus:ring-gray-500',
    disabled: 'disabled:bg-gray-50 disabled:text-gray-400',
  },
  outline: {
    base: 'bg-transparent text-gray-700 border-gray-300',
    hover: 'hover:bg-gray-50',
    focus: 'focus:ring-gray-500',
    disabled: 'disabled:bg-transparent disabled:text-gray-400',
  },
  ghost: {
    base: 'bg-transparent text-gray-600 border-transparent',
    hover: 'hover:bg-gray-100',
    focus: 'focus:ring-gray-500',
    disabled: 'disabled:bg-transparent disabled:text-gray-400',
  },
  success: {
    base: 'bg-green-600 text-white border-transparent',
    hover: 'hover:bg-green-700',
    focus: 'focus:ring-green-500',
    disabled: 'disabled:bg-green-300',
  },
  warning: {
    base: 'bg-yellow-500 text-white border-transparent',
    hover: 'hover:bg-yellow-600',
    focus: 'focus:ring-yellow-500',
    disabled: 'disabled:bg-yellow-300',
  },
  danger: {
    base: 'bg-red-600 text-white border-transparent',
    hover: 'hover:bg-red-700',
    focus: 'focus:ring-red-500',
    disabled: 'disabled:bg-red-300',
  },
  purple: {
    base: 'bg-purple-600 text-white border-transparent',
    hover: 'hover:bg-purple-700',
    focus: 'focus:ring-purple-500',
    disabled: 'disabled:bg-purple-300',
  },
};

export const BUTTON_SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

// Variantes de cards
export const CARD_VARIANTS = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-200 shadow-md',
  flat: 'bg-white border-0 shadow-none',
  outlined: 'bg-transparent border border-gray-200 shadow-none',
};

// Variantes de tabs
export const TAB_VARIANTS = {
  default: {
    base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
    active: 'bg-white text-blue-600 shadow-sm',
    inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  pills: {
    base: 'px-4 py-2 text-sm font-medium rounded-full transition-colors',
    active: 'bg-blue-600 text-white',
    inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  underline: {
    base: 'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
    active: 'border-blue-600 text-blue-600',
    inactive: 'border-transparent text-gray-600 hover:text-gray-900',
  },
};
