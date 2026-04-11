import { useState, useCallback, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { useAppStore } from '@core/store';
import { Book } from '@domain/models';
import { bookRepository } from '@data/repositories/bookRepository';
import { FileManagerService } from '@data/services/FileManagerService';
import {
  CalibreService,
  CalibreConnection,
  CalibreBook,
} from '@data/services/CalibreService';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface State {
  status: ConnectionStatus;
  error: string | null;
  connection: CalibreConnection | null;
  books: CalibreBook[];
  total: number;
  loadingMore: boolean;
  importingId: number | null;
  importedIds: Set<number>;
}

const PAGE_SIZE = 50;

export function useCalibreViewModel() {
  const { books: localBooks, setBooks } = useAppStore();

  const [state, setState] = useState<State>({
    status: 'disconnected',
    error: null,
    connection: null,
    books: [],
    total: 0,
    loadingMore: false,
    importingId: null,
    importedIds: new Set(),
  });

  // Load saved connection on mount
  useEffect(() => {
    CalibreService.loadConnection().then((conn) => {
      if (conn) setState((s) => ({ ...s, connection: conn, status: 'connected' }));
    });
  }, []);

  const connect = useCallback(
    async (url: string, username: string, password: string) => {
      setState((s) => ({ ...s, status: 'connecting', error: null }));
      try {
        const trimmedUrl = url.replace(/\/$/, '');
        const libraryId = await CalibreService.testConnection({
          url: trimmedUrl,
          username,
          password,
        });
        const conn: CalibreConnection = { url: trimmedUrl, username, password, libraryId };
        await CalibreService.saveConnection(conn);
        setState((s) => ({ ...s, connection: conn, status: 'connected', error: null }));
      } catch (e) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: e instanceof Error ? e.message : String(e),
        }));
      }
    },
    [],
  );

  const disconnect = useCallback(async () => {
    await CalibreService.clearConnection();
    setState((s) => ({
      ...s,
      status: 'disconnected',
      connection: null,
      books: [],
      total: 0,
      error: null,
    }));
  }, []);

  const loadBooks = useCallback(async () => {
    if (!state.connection) return;
    setState((s) => ({ ...s, loadingMore: true, error: null }));
    try {
      const { books, total } = await CalibreService.getBooks(state.connection, 0, PAGE_SIZE);
      setState((s) => ({ ...s, books, total, loadingMore: false }));
    } catch (e) {
      setState((s) => ({
        ...s,
        loadingMore: false,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, [state.connection]);

  const loadMore = useCallback(async () => {
    if (!state.connection || state.loadingMore || state.books.length >= state.total) return;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const { books } = await CalibreService.getBooks(
        state.connection,
        state.books.length,
        PAGE_SIZE,
      );
      setState((s) => ({ ...s, books: [...s.books, ...books], loadingMore: false }));
    } catch {
      setState((s) => ({ ...s, loadingMore: false }));
    }
  }, [state.connection, state.books.length, state.total, state.loadingMore]);

  const importBook = useCallback(
    async (calibreBook: CalibreBook) => {
      if (!state.connection) return;
      const format = calibreBook.formats.includes('EPUB') ? 'EPUB' : calibreBook.formats[0];
      if (!format) return;

      setState((s) => ({ ...s, importingId: calibreBook.id, error: null }));
      try {
        // Download the book file
        const filePath = await CalibreService.downloadBook(
          state.connection,
          calibreBook,
          format,
        );

        // Download cover
        const coverBase64 = await CalibreService.downloadCover(
          state.connection,
          calibreBook.id,
        );
        let coverPath: string | null = null;
        if (coverBase64) {
          coverPath = await FileManagerService.saveCover(
            `calibre_${calibreBook.id}`,
            coverBase64,
          );
        }

        const book: Book = {
          id: Crypto.randomUUID(),
          title: calibreBook.title,
          author: calibreBook.authors.join(', ') || 'Desconocido',
          format: format.toLowerCase() as 'epub' | 'pdf',
          filePath,
          coverPath,
          status: 'to_read',
          readingPosition: null,
          addedAt: Date.now(),
          lastOpenedAt: null,
        };

        await bookRepository.insert(book);
        const updated = await bookRepository.getAll();
        setBooks(updated);

        setState((s) => ({
          ...s,
          importingId: null,
          importedIds: new Set([...s.importedIds, calibreBook.id]),
        }));
      } catch (e) {
        setState((s) => ({
          ...s,
          importingId: null,
          error: e instanceof Error ? e.message : String(e),
        }));
      }
    },
    [state.connection, setBooks],
  );

  return {
    ...state,
    connect,
    disconnect,
    loadBooks,
    loadMore,
    importBook,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
