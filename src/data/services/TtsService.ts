import Tts from 'react-native-tts';

export type TtsState = 'idle' | 'playing' | 'paused';

let initialized = false;

export const TtsService = {
  async init(): Promise<void> {
    if (initialized) return;
    try {
      await Tts.getInitStatus();
    } catch {
      // Android may throw if TTS engine is not ready; ignore and continue
    }
    initialized = true;
  },

  speak(text: string, onFinish?: () => void): void {
    Tts.removeAllListeners('tts-finish');
    if (onFinish) {
      Tts.addEventListener('tts-finish', onFinish);
    }
    Tts.speak(text);
  },

  stop(): void {
    Tts.stop();
  },

  async pause(): Promise<void> {
    await Tts.pause();
  },

  async resume(): Promise<void> {
    await Tts.resume();
  },

  setRate(rate: number): void {
    Tts.setDefaultRate(rate, true);
  },

  setLanguage(lang: string): void {
    Tts.setDefaultLanguage(lang);
  },

  removeListeners(): void {
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-start');
    Tts.removeAllListeners('tts-progress');
    Tts.removeAllListeners('tts-error');
  },
};
