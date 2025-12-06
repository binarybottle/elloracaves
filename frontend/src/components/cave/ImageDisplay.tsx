'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';

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

  // Handle keyboard navigation in fullscreen
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFullscreen) return;
    
    if (e.key === 'Escape') {
      setIsFullscreen(false);
    } else if (e.key === 'ArrowLeft' && onPrev) {
      onPrev();
    } else if (e.key === 'ArrowRight' && onNext) {
      onNext();
    }
  }, [isFullscreen, onPrev, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={(e) => {
            // Close when clicking background
            if (e.target === e.currentTarget) {
              setIsFullscreen(false);
            }
          }}
        >
          {/* Close/Minimize Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
            title="Close fullscreen (Esc)"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
          
          {/* Fullscreen Image */}
          <img
            src={fullImageUrl}
            alt={image.subject || `Cave image ${image.id}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation Arrows in Fullscreen - Always visible */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              title="Previous image (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              title="Next image (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          
          {/* Image Counter in Fullscreen */}
          {totalImages > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
              {currentIndex + 1} / {totalImages}
            </div>
          )}
          
          {/* Image Title in Fullscreen */}
          {image.subject && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-black/50 rounded text-white text-sm max-w-md truncate">
              {image.subject}
            </div>
          )}
        </div>
      )}
    </>
  );
}
