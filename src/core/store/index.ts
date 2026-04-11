import { create } from 'zustand';
import { LibrarySlice, createLibrarySlice } from './librarySlice';
import { ReaderSlice, createReaderSlice } from './readerSlice';

type AppStore = LibrarySlice & ReaderSlice;

export const useAppStore = create<AppStore>((set) => ({
  ...createLibrarySlice(set as (fn: (state: LibrarySlice) => Partial<LibrarySlice>) => void),
  ...createReaderSlice(set as (fn: (state: ReaderSlice) => Partial<ReaderSlice>) => void),
}));
