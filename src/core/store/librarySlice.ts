import { Book, ReadingStatus } from '@domain/models';

export interface LibrarySlice {
  books: Book[];
  setBooks: (books: Book[]) => void;
  updateBookStatus: (id: string, status: ReadingStatus) => void;
  updateReadingPosition: (id: string, position: string) => void;
  removeBook: (id: string) => void;
}

export const createLibrarySlice = (
  set: (fn: (state: LibrarySlice) => Partial<LibrarySlice>) => void,
): LibrarySlice => ({
  books: [],

  setBooks: (books) => set(() => ({ books })),

  updateBookStatus: (id, status) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, status } : b)),
    })),

  updateReadingPosition: (id, position) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === id ? { ...b, readingPosition: position, lastOpenedAt: Date.now() } : b,
      ),
    })),

  removeBook: (id) =>
    set((state) => ({
      books: state.books.filter((b) => b.id !== id),
    })),
});
