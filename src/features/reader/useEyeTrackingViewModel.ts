import { useCallback, useEffect, useRef, useState } from 'react';
import { EyeTrackingService } from '@data/services/EyeTrackingService';

interface Options {
  /** Called when the user looks away from the screen */
  onLookAway?: () => void;
  /** Called when the user looks back at the screen */
  onLookBack?: () => void;
}

export function useEyeTrackingViewModel({ onLookAway, onLookBack }: Options = {}) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [isLooking, setIsLooking] = useState(true);

  const onLookAwayRef = useRef(onLookAway);
  const onLookBackRef = useRef(onLookBack);
  useEffect(() => { onLookAwayRef.current = onLookAway; }, [onLookAway]);
  useEffect(() => { onLookBackRef.current = onLookBack; }, [onLookBack]);

  // Check device support on mount
  useEffect(() => {
    EyeTrackingService.isSupported().then(setSupported);
  }, []);

  // Subscribe to events when enabled
  useEffect(() => {
    if (!enabled) return;
    EyeTrackingService.startTracking();

    const unsubscribe = EyeTrackingService.subscribe((event) => {
      setIsLooking(event.isLooking);
      if (!event.isLooking) onLookAwayRef.current?.();
      else onLookBackRef.current?.();
    });

    return () => {
      unsubscribe();
      EyeTrackingService.stopTracking();
    };
  }, [enabled]);

  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => {
    setEnabled(false);
    setIsLooking(true);
  }, []);

  return {
    supported,
    enabled,
    isLooking,
    enable,
    disable,
    toggle: useCallback(
      () => (enabled ? disable() : enable()),
      [enabled, enable, disable],
    ),
  };
}
