export const themeConfig = {
  defaultTheme: 'system',
  themes: ['light', 'dark'],
  storageKey: 'moodflix-theme',
  disableTransitionOnChange: true,
  style: {
    light: {
      background: 'bg-white',
      text: 'text-gray-900',
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-gray-100 hover:bg-gray-200',
      accent: 'text-purple-600',
      card: 'bg-white border border-gray-200',
      muted: 'text-gray-500',
    },
    dark: {
      background: 'bg-gray-950',
      text: 'text-gray-50',
      primary: 'bg-purple-500 hover:bg-purple-600',
      secondary: 'bg-gray-800 hover:bg-gray-700',
      accent: 'text-purple-400',
      card: 'bg-gray-900 border border-gray-800',
      muted: 'text-gray-400',
    },
  },
} 