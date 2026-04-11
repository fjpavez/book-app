import { ReaderTheme } from '@core/store/readerSlice';

export interface ThemeColors {
  background: string;
  text: string;
  uiBackground: string;
  uiBorder: string;
  accent: string;
  muted: string;
}

export const READER_THEMES: Record<ReaderTheme, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#1a1a1a',
    uiBackground: '#f5f5f5',
    uiBorder: '#e0e0e0',
    accent: '#2563eb',
    muted: '#888888',
  },
  sepia: {
    background: '#f4ecd8',
    text: '#3b2a1e',
    uiBackground: '#ede0c4',
    uiBorder: '#cdb898',
    accent: '#8b5e3c',
    muted: '#9a7a5c',
  },
  dark: {
    background: '#2d2d2d',
    text: '#e0e0e0',
    uiBackground: '#3a3a3a',
    uiBorder: '#555555',
    accent: '#60a5fa',
    muted: '#999999',
  },
  black: {
    background: '#000000',
    text: '#ffffff',
    uiBackground: '#111111',
    uiBorder: '#333333',
    accent: '#60a5fa',
    muted: '#888888',
  },
};

export const FONT_FAMILIES = [
  { label: 'Sistema', value: 'System' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
];

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 32;
export const FONT_SIZE_STEP = 1;

// CSS injected into WebView-based readers (epub)
export function buildEpubThemeCSS(
  theme: ReaderTheme,
  fontSize: number,
  fontFamily: string,
  lineHeight: number,
  marginHorizontal: number,
): string {
  const colors = READER_THEMES[theme];
  return `
    body {
      background: ${colors.background} !important;
      color: ${colors.text} !important;
      font-size: ${fontSize}px !important;
      font-family: ${fontFamily === 'System' ? '-apple-system, sans-serif' : `"${fontFamily}", serif`} !important;
      line-height: ${lineHeight} !important;
      margin: 0 ${marginHorizontal}px !important;
      padding: 0 !important;
    }
    a { color: ${colors.accent} !important; }
    p, div, span { color: ${colors.text} !important; }
  `;
}
