import { useCallback, useEffect, useRef, useState } from 'react';
import { Book } from '@domain/models';
import { EpubTextExtractor } from '@data/services/EpubTextExtractor';
import { File } from 'expo-file-system';

export type RsvpState = 'idle' | 'loading' | 'playing' | 'paused';

const DEFAULT_WPM = 300;
const MIN_WPM = 100;
const MAX_WPM = 600;
const WPM_STEP = 50;

export function useRsvpViewModel(book: Book | null, currentCfi: string | null) {
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(DEFAULT_WPM);

  const wordsRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const stateRef = useRef<RsvpState>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { wordsRef.current = words; }, [words]);
  useEffect(() => { stateRef.current = rsvpState; }, [rsvpState]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(
    (wordsPerMin: number) => {
      stopInterval();
      const ms = Math.round(60000 / wordsPerMin);
      intervalRef.current = setInterval(() => {
        const next = indexRef.current + 1;
        if (next >= wordsRef.current.length) {
          stopInterval();
          setRsvpState('idle');
          setCurrentIndex(0);
          indexRef.current = 0;
          return;
        }
        indexRef.current = next;
        setCurrentIndex(next);
      }, ms);
    },
    [stopInterval],
  );

  const loadWords = useCallback(async (): Promise<string[]> => {
    if (!book) return [];
    setRsvpState('loading');
    try {
      let sentences: string[] = [];
      if (book.format === 'epub') {
        sentences = await EpubTextExtractor.extractSentencesAtCfi(
          book.filePath,
          currentCfi ?? '',
        );
      } else if (book.format === 'md') {
        const text = await new File(book.filePath).text();
        sentences = EpubTextExtractor.splitMarkdownSentences(text);
      }
      const allWords = sentences
        .join(' ')
        .split(/\s+/)
        .filter((w) => w.length > 0);
      setWords(allWords);
      wordsRef.current = allWords;
      return allWords;
    } catch {
      setRsvpState('idle');
      return [];
    }
  }, [book, currentCfi]);

  const play = useCallback(async () => {
    if (rsvpState === 'paused') {
      setRsvpState('playing');
      stateRef.current = 'playing';
      startInterval(wpm);
      return;
    }

    let w = wordsRef.current;
    if (w.length === 0) {
      w = await loadWords();
    }
    if (w.length === 0) return;

    setRsvpState('playing');
    stateRef.current = 'playing';
    startInterval(wpm);
  }, [rsvpState, wpm, loadWords, startInterval]);

  const pause = useCallback(() => {
    stopInterval();
    setRsvpState('paused');
  }, [stopInterval]);

  const stop = useCallback(() => {
    stopInterval();
    setRsvpState('idle');
    setCurrentIndex(0);
    indexRef.current = 0;
    setWords([]);
    wordsRef.current = [];
  }, [stopInterval]);

  const increaseWpm = useCallback(() => {
    setWpm((prev) => {
      const next = Math.min(MAX_WPM, prev + WPM_STEP);
      if (stateRef.current === 'playing') startInterval(next);
      return next;
    });
  }, [startInterval]);

  const decreaseWpm = useCallback(() => {
    setWpm((prev) => {
      const next = Math.max(MIN_WPM, prev - WPM_STEP);
      if (stateRef.current === 'playing') startInterval(next);
      return next;
    });
  }, [startInterval]);

  // Reset words when CFI changes (chapter navigation)
  const prevCfiRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentCfi && currentCfi !== prevCfiRef.current) {
      prevCfiRef.current = currentCfi;
      if (stateRef.current !== 'idle') stop();
      else {
        setWords([]);
        wordsRef.current = [];
      }
    }
  }, [currentCfi, stop]);

  useEffect(() => () => stopInterval(), [stopInterval]);

  return {
    rsvpState,
    currentWord: words[currentIndex] ?? '',
    currentIndex,
    wordCount: words.length,
    wpm,
    minWpm: MIN_WPM,
    maxWpm: MAX_WPM,
    play,
    pause,
    stop,
    increaseWpm,
    decreaseWpm,
  };
}
