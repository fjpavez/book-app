import { Book } from '@domain/models';

export type ReaderScrollMode = 'paginated' | 'scroll';
export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'black';

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  theme: ReaderTheme;
  scrollMode: ReaderScrollMode;
  lineHeight: number;
  marginHorizontal: number;
}

export interface ReaderSlice {
  activeBook: Book | null;
  settings: ReaderSettings;
  setActiveBook: (book: Book | null) => void;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 17,
  fontFamily: 'System',
  theme: 'light',
  scrollMode: 'paginated',
  lineHeight: 1.6,
  marginHorizontal: 20,
};

export const createReaderSlice = (
  set: (fn: (state: ReaderSlice) => Partial<ReaderSlice>) => void,
): ReaderSlice => ({
  activeBook: null,
  settings: defaultSettings,

  setActiveBook: (book) => set(() => ({ activeBook: book })),

  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
});
