'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="relative w-full">
      <div className="relative bg-black rounded-lg overflow-hidden w-full group">
        <img
          src={fullImageUrl}
          alt={image.subject || `Cave image ${image.id}`}
          className="w-full h-auto object-contain max-h-[calc(100vh-300px)]"
          loading="lazy"
        />
        
        {/* Navigation Arrows */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Previous image (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}
