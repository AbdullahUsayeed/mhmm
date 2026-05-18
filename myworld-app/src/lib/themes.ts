export interface ThemeColors {
  primary: string; light: string; dark: string;
  bg: string; glow: string; text: string; accent: string;
}

export const THEMES: Record<string, ThemeColors> = {
  pink:   { primary:'#FF69B4', light:'#FFB6C1', dark:'#C71585', bg:'#1a001a', glow:'#3d004d', text:'#FFD6E8', accent:'#DB2779' },
  blue:   { primary:'#4DA6FF', light:'#B3D9FF', dark:'#1E40AF', bg:'#001a2e', glow:'#001a3d', text:'#D6EAFF', accent:'#2563EB' },
  purple: { primary:'#A855F7', light:'#D8B4FE', dark:'#6B21A8', bg:'#1a002e', glow:'#2d004d', text:'#E9D5FF', accent:'#7C3AED' },
  emerald:{ primary:'#34D399', light:'#A7F3D0', dark:'#047857', bg:'#001a0e', glow:'#002d18', text:'#D1FAE5', accent:'#059669' },
  dark:   { primary:'#F472B6', light:'#FBCFE8', dark:'#831843', bg:'#0a0a0a', glow:'#1a1a1a', text:'#FCE7F3', accent:'#BE185D' },
  sunset: { primary:'#FB923C', light:'#FED7AA', dark:'#C2410C', bg:'#1a0a00', glow:'#2d1500', text:'#FFEDD5', accent:'#EA580C' },
};

export const FREE_THEMES = ['pink', 'blue'];
export const PREMIUM_THEMES = ['purple', 'emerald', 'dark', 'sunset'];

export function getTheme(key: string): ThemeColors {
  return THEMES[key] || THEMES.pink;
}
