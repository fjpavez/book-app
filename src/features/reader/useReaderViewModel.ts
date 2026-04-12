import { useCallback, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Alert, Share } from 'react-native';
import { useAppStore } from '@core/store';
import { Annotation, Bookmark, HighlightColor } from '@domain/models';
import { bookRepository } from '@data/repositories/bookRepository';
import { annotationRepository } from '@data/repositories/annotationRepository';
import { bookmarkRepository } from '@data/repositories/bookmarkRepository';
import { ExportService } from '@data/services/ExportService';

export interface TocItem {
  id: string;
  label: string;
  href: string;
  subitems?: TocItem[];
}

export interface PendingSelection {
  cfiRange: string;
  selectedText: string;
}

export function useReaderViewModel(bookId: string) {
  const { books, settings, setActiveBook, updateReadingPosition, updateSettings } = useAppStore();
  const book = books.find((b) => b.id === bookId) ?? null;

  // Chrome
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Panels
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [annotationsPanelOpen, setAnnotationsPanelOpen] = useState(false);

  // TOC
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentLabel, setCurrentLabel] = useState('');

  // Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  // Load book data on mount
  useEffect(() => {
    if (book) {
      setActiveBook(book);
      annotationRepository.getByBookId(book.id).then(setAnnotations).catch(console.error);
      bookmarkRepository.getByBookId(book.id).then(setBookmarks).catch(console.error);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setActiveBook(null);
    };
  }, [book?.id]);

  // Chrome auto-hide
  const showChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChromeVisible(false), 3500);
  }, []);

  const toggleChrome = useCallback(() => {
    if (chromeVisible) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setChromeVisible(false);
    } else {
      showChrome();
    }
  }, [chromeVisible, showChrome]);

  // Position
  const savePosition = useCallback(
    async (position: string) => {
      if (!book) return;
      await bookRepository.updateReadingPosition(book.id, position);
      updateReadingPosition(book.id, position);
    },
    [book, updateReadingPosition],
  );

  // Annotations
  const addAnnotation = useCallback(
    async (
      cfiRange: string,
      selectedText: string,
      color: HighlightColor,
      note: string | null,
    ) => {
      if (!book) return null;
      const annotation: Annotation = {
        id: Crypto.randomUUID(),
        bookId: book.id,
        position: cfiRange,
        selectedText,
        note,
        color,
        chapter: currentLabel || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await annotationRepository.insert(annotation);
      setAnnotations((prev) => [...prev, annotation]);
      setPendingSelection(null);
      return annotation;
    },
    [book, currentLabel],
  );

  const updateAnnotationNote = useCallback(async (id: string, note: string) => {
    await annotationRepository.updateNote(id, note);
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, note, updatedAt: Date.now() } : a)),
    );
    setEditingAnnotation(null);
  }, []);

  const deleteAnnotation = useCallback(async (id: string) => {
    await annotationRepository.delete(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Bookmarks
  const addBookmark = useCallback(async () => {
    if (!book || !book.readingPosition) return;
    const exists = await bookmarkRepository.existsAtPosition(book.id, book.readingPosition);
    if (exists) {
      Alert.alert('Marcador', 'Ya existe un marcador en esta posición.');
      return;
    }
    const bookmark: Bookmark = {
      id: Crypto.randomUUID(),
      bookId: book.id,
      position: book.readingPosition,
      label: currentLabel || null,
      chapter: currentLabel || null,
      createdAt: Date.now(),
    };
    await bookmarkRepository.insert(bookmark);
    setBookmarks((prev) => [...prev, bookmark]);
  }, [book, currentLabel]);

  const deleteBookmark = useCallback(async (id: string) => {
    await bookmarkRepository.delete(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Export
  const exportAnnotations = useCallback(
    async (format: 'md' | 'txt') => {
      if (!book) return;
      const content =
        format === 'md'
          ? ExportService.toMarkdown(book, annotations, bookmarks)
          : ExportService.toPlainText(book, annotations, bookmarks);

      const slug = book.title.replace(/\s+/g, '_').toLowerCase().slice(0, 30);
      const filename = `${slug}_anotaciones.${format === 'md' ? 'md' : 'txt'}`;
      const uri = ExportService.saveToExports(filename, content);

      await Share.share({ message: content, title: filename });
    },
    [book, annotations, bookmarks],
  );

  return {
    book,
    settings,
    updateSettings,
    // Chrome
    chromeVisible,
    toggleChrome,
    showChrome,
    // Panels
    settingsPanelOpen,
    setSettingsPanelOpen,
    tocOpen,
    setTocOpen,
    annotationsPanelOpen,
    setAnnotationsPanelOpen,
    // TOC
    toc,
    setToc,
    currentLabel,
    setCurrentLabel,
    // Position
    savePosition,
    // Annotations
    annotations,
    pendingSelection,
    setPendingSelection,
    editingAnnotation,
    setEditingAnnotation,
    addAnnotation,
    updateAnnotationNote,
    deleteAnnotation,
    // Bookmarks
    bookmarks,
    addBookmark,
    deleteBookmark,
    // Export
    exportAnnotations,
  };
}
