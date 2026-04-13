import { useCallback, useState } from 'react';

export type AutoScrollSpeed = 1 | 2 | 3 | 4 | 5;

/** Pixels per second for each speed level */
export const AUTO_SCROLL_PX_PER_SEC: Record<AutoScrollSpeed, number> = {
  1: 20,
  2: 45,
  3: 80,
  4: 120,
  5: 170,
};

const SPEED_LABELS: Record<AutoScrollSpeed, string> = {
  1: '×1',
  2: '×2',
  3: '×3',
  4: '×4',
  5: '×5',
};

export function useAutoScrollViewModel() {
  const [active, setActive] = useState(false);
  const [speed, setSpeed] = useState<AutoScrollSpeed>(2);

  const toggle = useCallback(() => setActive((v) => !v), []);
  const pause = useCallback(() => setActive(false), []);

  const increaseSpeed = useCallback(
    () => setSpeed((s) => (Math.min(5, s + 1) as AutoScrollSpeed)),
    [],
  );
  const decreaseSpeed = useCallback(
    () => setSpeed((s) => (Math.max(1, s - 1) as AutoScrollSpeed)),
    [],
  );

  return {
    active,
    speed,
    speedLabel: SPEED_LABELS[speed],
    pxPerSec: AUTO_SCROLL_PX_PER_SEC[speed],
    toggle,
    pause,
    increaseSpeed,
    decreaseSpeed,
  };
}
