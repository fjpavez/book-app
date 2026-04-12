import { useState, useCallback, useEffect, useRef } from 'react';
import { Book } from '@domain/models';
import { TtsService, TtsState } from '@data/services/TtsService';
import { EpubTextExtractor } from '@data/services/EpubTextExtractor';
import { File } from 'expo-file-system';

export function useTtsViewModel(book: Book | null, currentCfi: string | null) {
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rate, setRateState] = useState(1.0);
  const [loading, setLoading] = useState(false);

  // Refs to avoid stale closures in TTS callbacks
  const sentencesRef = useRef<string[]>([]);
  const stateRef = useRef<TtsState>('idle');
  const indexRef = useRef(0);

  useEffect(() => { sentencesRef.current = sentences; }, [sentences]);
  useEffect(() => { stateRef.current = ttsState; }, [ttsState]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);

  const speakAt = useCallback((idx: number) => {
    const sents = sentencesRef.current;
    if (idx >= sents.length) {
      TtsService.removeListeners();
      setTtsState('idle');
      setCurrentIndex(0);
      indexRef.current = 0;
      return;
    }
    indexRef.current = idx;
    setCurrentIndex(idx);
    TtsService.speak(sents[idx], () => {
      if (stateRef.current === 'playing') {
        speakAt(indexRef.current + 1);
      }
    });
  }, []);

  const loadSentences = useCallback(async (cfi: string): Promise<string[]> => {
    if (!book) return [];
    setLoading(true);
    try {
      let sents: string[] = [];
      if (book.format === 'epub') {
        sents = await EpubTextExtractor.extractSentencesAtCfi(book.filePath, cfi);
      } else if (book.format === 'md') {
        const text = await new File(book.filePath).text();
        sents = EpubTextExtractor.splitMarkdownSentences(text);
      }
      setSentences(sents);
      sentencesRef.current = sents;
      return sents;
    } finally {
      setLoading(false);
    }
  }, [book]);

  const play = useCallback(async () => {
    if (!book) return;

    if (ttsState === 'paused') {
      await TtsService.resume();
      setTtsState('playing');
      stateRef.current = 'playing';
      return;
    }

    await TtsService.init();

    let sents = sentencesRef.current;
    if (sents.length === 0) {
      if (!currentCfi && book.format === 'epub') return;
      sents = await loadSentences(currentCfi ?? '');
    }
    if (sents.length === 0) return;

    setTtsState('playing');
    stateRef.current = 'playing';
    speakAt(indexRef.current);
  }, [book, ttsState, currentCfi, loadSentences, speakAt]);

  const pause = useCallback(async () => {
    await TtsService.pause();
    setTtsState('paused');
  }, []);

  const stop = useCallback(() => {
    TtsService.stop();
    TtsService.removeListeners();
    setTtsState('idle');
    setCurrentIndex(0);
    indexRef.current = 0;
  }, []);

  const next = useCallback(() => {
    const idx = Math.min(indexRef.current + 1, sentencesRef.current.length - 1);
    TtsService.stop();
    setCurrentIndex(idx);
    indexRef.current = idx;
    if (stateRef.current === 'playing') speakAt(idx);
  }, [speakAt]);

  const prev = useCallback(() => {
    const idx = Math.max(indexRef.current - 1, 0);
    TtsService.stop();
    setCurrentIndex(idx);
    indexRef.current = idx;
    if (stateRef.current === 'playing') speakAt(idx);
  }, [speakAt]);

  const changeRate = useCallback((newRate: number) => {
    TtsService.setRate(newRate);
    setRateState(newRate);
  }, []);

  // When CFI changes (chapter navigation), reset sentences so they reload on next play
  const prevCfiRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentCfi && currentCfi !== prevCfiRef.current) {
      prevCfiRef.current = currentCfi;
      if (ttsState !== 'idle') {
        // Chapter changed while playing — stop and reload
        stop();
      }
      setSentences([]);
      sentencesRef.current = [];
    }
  }, [currentCfi, ttsState, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      TtsService.stop();
      TtsService.removeListeners();
    };
  }, []);

  return {
    ttsState,
    ttsLoading: loading,
    currentSentence: ttsState !== 'idle' ? (sentences[currentIndex] ?? null) : null,
    currentIndex,
    sentenceCount: sentences.length,
    rate,
    play,
    pause,
    stop,
    next,
    prev,
    changeRate,
  };
}
