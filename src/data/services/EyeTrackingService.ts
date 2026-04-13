import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { ARKitEyeTracking } = NativeModules;

export interface AttentionChangeEvent {
  isLooking: boolean;
  error?: string;
}

const emitter = ARKitEyeTracking
  ? new NativeEventEmitter(ARKitEyeTracking)
  : null;

export const EyeTrackingService = {
  /** True only on iOS with TrueDepth camera support */
  get nativeAvailable(): boolean {
    return Platform.OS === 'ios' && !!ARKitEyeTracking;
  },

  /** Resolves to true if current device has TrueDepth camera (iPhone X+) */
  async isSupported(): Promise<boolean> {
    if (!this.nativeAvailable) return false;
    try {
      return await ARKitEyeTracking.isSupported();
    } catch {
      return false;
    }
  },

  startTracking(): void {
    ARKitEyeTracking?.startTracking();
  },

  stopTracking(): void {
    ARKitEyeTracking?.stopTracking();
  },

  /** Subscribe to attention changes. Returns an unsubscribe function. */
  subscribe(handler: (event: AttentionChangeEvent) => void): () => void {
    if (!emitter) return () => {};
    const sub = emitter.addListener('onAttentionChange', handler);
    return () => sub.remove();
  },
};
