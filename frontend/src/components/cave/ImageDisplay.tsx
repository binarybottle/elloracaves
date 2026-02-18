'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { Image as ImageType, fetchImageSiblingGroup } from '@/lib/api';

interface ImageDisplayProps {
  image: ImageType | null;
  cave: any;
  floorNumber: number;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalImages?: number;
}

export default function ImageDisplay({ 
  image, 
  cave, 
  floorNumber,
  onPrev,
  onNext,
  currentIndex = 0,
  totalImages = 0
}: ImageDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<ImageType | null>(null);
  const [associatedImages, setAssociatedImages] = useState<ImageType[]>([]);

  useEffect(() => {
    if (!image) { setAssociatedImages([]); return; }
    setFullscreenImage(null);
    let cancelled = false;
    fetchImageSiblingGroup(image.id, image.best_id).then(imgs => {
      if (!cancelled) setAssociatedImages(imgs);
    });
    return () => { cancelled = true; };
  }, [image?.id, image?.best_id]);

  const stateRef = useRef({ image, associatedImages, fullscreenImage, isFullscreen, onPrev, onNext });
  stateRef.current = { image, associatedImages, fullscreenImage, isFullscreen, onPrev, onNext };

  const navigateFullscreen = useCallback((dir: 1 | -1) => {
    const { image: img, associatedImages: assoc, fullscreenImage: fsImg, onPrev: prev, onNext: next } = stateRef.current;
    if (!img) return;
    const all = [img, ...assoc];
    if (all.length > 1) {
      const currentId = fsImg?.id ?? img.id;
      const idx = all.findIndex(i => i.id === currentId);
      const nextIdx = (idx + dir + all.length) % all.length;
      const nextImg = all[nextIdx];
      setFullscreenImage(nextImg.id === img.id ? null : nextImg);
    } else {
      if (dir === -1 && prev) prev();
      if (dir === 1 && next) next();
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!stateRef.current.isFullscreen) return;
      if (e.key === 'Escape') setIsFullscreen(false);
      else if (e.key === 'ArrowLeft') navigateFullscreen(-1);
      else if (e.key === 'ArrowRight') navigateFullscreen(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigateFullscreen]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Check if image exists and has a valid image_url
  if (!image || !image.image_url || image.image_url.trim() === '') {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500 text-center p-8">
          <p>Select an image to view</p>
          {image && !image.image_url && (
            <p className="text-xs text-gray-600 mt-2">Image {image.id} has no image URL</p>
          )}
        </div>
      </div>
    );
  }

  // Use the image_url directly - it's already a full URL from the API
  const fullImageUrl = image.image_url;

  return (
    <>
      <div className="relative w-full">
        <div className="relative bg-black rounded-lg overflow-hidden w-full">
          <img
            src={fullImageUrl}
            alt={image.subject || `Cave image ${image.id}`}
            className="w-full h-auto object-contain max-h-[calc(100vh-300px)]"
            loading="lazy"
          />
          
          {/* Expand Button - Always visible */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            title="Expand image"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          
          {/* Navigation Arrows - Always visible */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              title="Previous image (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              title="Next image (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          
          {/* Image Counter */}
          {totalImages > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
              {currentIndex + 1} / {totalImages}
            </div>
          )}
        </div>
      </div>

      {associatedImages.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Similar images</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {associatedImages.map(aImg => (
              <img
                key={aImg.id}
                src={aImg.thumbnail_url}
                alt={aImg.subject || `Image ${aImg.id}`}
                className="w-16 h-16 object-cover rounded cursor-pointer border border-gray-700 hover:border-gray-400 transition-colors flex-shrink-0"
                onClick={() => { setFullscreenImage(aImg); setIsFullscreen(true); }}
                title={aImg.subject || `Image ${aImg.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (() => {
        const fsImg = fullscreenImage || image;
        const fsUrl = fsImg.image_url;
        const hasAlts = associatedImages.length > 0;
        return (
          <div
            className="fixed inset-0 z-50 bg-black flex"
            onClick={(e) => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
          >
            {/* Main image area */}
            <div className={`flex-1 flex items-center justify-center relative ${hasAlts ? 'mr-0' : ''}`}>
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
                title="Close fullscreen (Esc)"
              >
                <Minimize2 className="w-6 h-6" />
              </button>

              <img
                src={fsUrl}
                alt={fsImg.subject || `Cave image ${fsImg.id}`}
                className="max-w-full max-h-full object-contain"
              />

              <button onClick={() => navigateFullscreen(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors" title="Previous image (←)">
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button onClick={() => navigateFullscreen(1)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors" title="Next image (→)">
                <ChevronRight className="w-8 h-8" />
              </button>

              {totalImages > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                  {currentIndex + 1} / {totalImages}
                </div>
              )}

              {fsImg.subject && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 rounded text-white text-sm max-w-md truncate">
                  {fsImg.subject}
                </div>
              )}
            </div>

            {/* Associated images sidebar */}
            {hasAlts && (
              <div className="w-20 bg-black/80 border-l border-gray-800 flex flex-col overflow-y-auto py-2 px-1.5 gap-1.5">
                <button
                  onClick={() => setFullscreenImage(null)}
                  className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                    !fullscreenImage ? 'border-white' : 'border-gray-700 hover:border-gray-400'
                  }`}
                  title={image.subject || `Image ${image.id} (selected)`}
                >
                  <img src={image.thumbnail_url} alt={image.subject || `Image ${image.id}`} className="w-full aspect-square object-cover" />
                </button>
                {associatedImages.map(aImg => (
                  <button
                    key={aImg.id}
                    onClick={() => setFullscreenImage(aImg)}
                    className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                      fullscreenImage?.id === aImg.id ? 'border-white' : 'border-gray-700 hover:border-gray-400'
                    }`}
                    title={aImg.subject || `Image ${aImg.id}`}
                  >
                    <img src={aImg.thumbnail_url} alt={aImg.subject || `Image ${aImg.id}`} className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
