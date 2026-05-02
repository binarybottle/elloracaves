'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThumbnailSize = 'sm' | 'md' | 'lg';

export const SIZE_HEIGHTS: Record<ThumbnailSize, string> = {
  sm: 'h-14',   // 56px
  md: 'h-24',   // 96px — default
  lg: 'h-40',   // 160px
};

interface ThumbnailSizeContextValue {
  size: ThumbnailSize;
  setSize: (s: ThumbnailSize) => void;
  heightClass: string;
}

const ThumbnailSizeContext = createContext<ThumbnailSizeContextValue>({
  size: 'md',
  setSize: () => {},
  heightClass: SIZE_HEIGHTS.md,
});

export function ThumbnailSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<ThumbnailSize>('md');

  useEffect(() => {
    const saved = localStorage.getItem('thumbSize') as ThumbnailSize | null;
    if (saved && saved in SIZE_HEIGHTS) setSize(saved);
  }, []);

  const handleSetSize = (s: ThumbnailSize) => {
    setSize(s);
    localStorage.setItem('thumbSize', s);
  };

  return (
    <ThumbnailSizeContext.Provider value={{ size, setSize: handleSetSize, heightClass: SIZE_HEIGHTS[size] }}>
      {children}
    </ThumbnailSizeContext.Provider>
  );
}

export function useThumbnailSize() {
  return useContext(ThumbnailSizeContext);
}
