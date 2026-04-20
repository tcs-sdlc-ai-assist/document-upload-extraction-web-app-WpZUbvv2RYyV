// src/theme.ts
// Optional Tailwind theme config for custom colors/spacing

const theme = {
  colors: {
    primary: {
      light: '#4f8cff',
      DEFAULT: '#2563eb',
      dark: '#1e40af',
    },
    secondary: {
      light: '#fbbf24',
      DEFAULT: '#f59e42',
      dark: '#b45309',
    },
    error: {
      light: '#fca5a5',
      DEFAULT: '#ef4444',
      dark: '#991b1b',
    },
    success: {
      light: '#6ee7b7',
      DEFAULT: '#10b981',
      dark: '#065f46',
    },
    background: {
      light: '#f9fafb',
      DEFAULT: '#f3f4f6',
      dark: '#1f2937',
    },
    text: {
      light: '#374151',
      DEFAULT: '#111827',
      dark: '#f3f4f6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
  },
  borderRadius: {
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};

export default theme;