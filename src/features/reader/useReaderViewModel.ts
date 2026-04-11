import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@core/store';
import { bookRepository } from '@data/repositories/bookRepository';
import { Book } from '@domain/models';

export interface TocItem {
  id: string;
  label: string;
  href: string;
  subitems?: TocItem[];
}

export function useReaderViewModel(bookId: string) {
  const { books, settings, setActiveBook, updateReadingPosition, updateSettings } = useAppStore();

  const book = books.find((b) => b.id === bookId) ?? null;

  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentLabel, setCurrentLabel] = useState<string>('');

  // Auto-hide chrome after 3s of inactivity
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (book) setActiveBook(book);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setActiveBook(null);
    };
  }, [book, setActiveBook]);

  const savePosition = useCallback(
    async (position: string) => {
      if (!book) return;
      await bookRepository.updateReadingPosition(book.id, position);
      updateReadingPosition(book.id, position);
    },
    [book, updateReadingPosition],
  );

  return {
    book,
    settings,
    updateSettings,
    chromeVisible,
    toggleChrome,
    showChrome,
    settingsPanelOpen,
    setSettingsPanelOpen,
    tocOpen,
    setTocOpen,
    toc,
    setToc,
    currentLabel,
    setCurrentLabel,
    savePosition,
  };
}
