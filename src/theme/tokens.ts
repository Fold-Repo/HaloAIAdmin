export const themeTokens = {
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  colors: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',
    destructive: 'var(--destructive)',
    border: 'var(--border)',
    sidebar: 'var(--sidebar)',
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'ai-creator-theme';
