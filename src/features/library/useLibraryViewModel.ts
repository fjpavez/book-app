import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Book, ReadingStatus } from '@domain/models';
import { bookRepository } from '@data/repositories/bookRepository';
import { EpubMetadataService } from '@data/services/EpubMetadataService';
import { FileManagerService } from '@data/services/FileManagerService';
import { useAppStore } from '@core/store';

export type SortKey = 'date' | 'title' | 'author';
export type ViewMode = 'grid' | 'list';

export function useLibraryViewModel() {
  const { books, setBooks, updateBookStatus, removeBook } = useAppStore();
  const [isImporting, setIsImporting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | 'all'>('all');

  // Load books from DB on mount
  useEffect(() => {
    bookRepository.getAll().then(setBooks).catch(console.error);
  }, [setBooks]);

  const importBooks = useCallback(async () => {
    setIsImporting(true);
    try {
      const picked = await FileManagerService.pickFiles();
      if (picked.length === 0) return;

      const newBooks: Book[] = [];

      for (const file of picked) {
        let title = file.name.replace(/\.[^.]+$/, '');
        let author = 'Autor desconocido';
        let coverPath: string | null = null;

        if (file.format === 'epub') {
          const meta = await EpubMetadataService.extract(file.destPath);
          title = meta.title;
          author = meta.author;
          if (meta.coverBase64) {
            coverPath = FileManagerService.saveCover(file.id, meta.coverBase64);
          }
        }

        const book: Book = {
          id: file.id,
          title,
          author,
          format: file.format,
          filePath: file.destPath,
          coverPath,
          status: 'unorganized',
          readingPosition: null,
          addedAt: Date.now(),
          lastOpenedAt: null,
        };

        await bookRepository.insert(book);
        newBooks.push(book);
      }

      const updated = await bookRepository.getAll();
      setBooks(updated);
    } catch (e) {
      Alert.alert('Error al importar', 'No se pudo importar uno o más archivos.');
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  }, [setBooks]);

  const deleteBook = useCallback(
    async (book: Book) => {
      await bookRepository.delete(book.id);
      FileManagerService.deleteBook(book.filePath, book.coverPath);
      removeBook(book.id);
    },
    [removeBook],
  );

  const changeStatus = useCallback(
    async (bookId: string, status: ReadingStatus) => {
      await bookRepository.updateStatus(bookId, status);
      updateBookStatus(bookId, status);
    },
    [updateBookStatus],
  );

  const filteredBooks = books
    .filter((b) => activeFilter === 'all' || b.status === activeFilter)
    .sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'author') return a.author.localeCompare(b.author);
      return b.addedAt - a.addedAt; // date desc
    });

  return {
    books: filteredBooks,
    isImporting,
    sortKey,
    setSortKey,
    viewMode,
    setViewMode,
    activeFilter,
    setActiveFilter,
    importBooks,
    deleteBook,
    changeStatus,
  };
}
