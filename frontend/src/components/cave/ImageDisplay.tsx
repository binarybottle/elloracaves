'use client';

import ImageWithFallback from '@/components/image/ImageWithFallback';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface ImageDisplayProps {
  image: any;
  cave: any;
  floorNumber: number;
  onPrevImage?: () => void;
  onNextImage?: () => void;
  showNavigation?: boolean;
}

export default function ImageDisplay({ image, cave, floorNumber, onPrevImage, onNextImage, showNavigation = false }: ImageDisplayProps) {
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

  const fullImageUrl = `${IMAGE_BASE_URL}${image.image_url}`;

  return (
    <div className="relative w-full group">
      <div className="relative bg-black rounded-lg overflow-hidden w-full">
        <img
          src={fullImageUrl}
          alt={image.subject || `Cave image ${image.id}`}
          className="w-full h-auto object-contain max-h-[calc(100vh-300px)]"
        />
        
        {/* Navigation arrows - show on hover */}
        {showNavigation && onPrevImage && onNextImage && (
          <>
            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

