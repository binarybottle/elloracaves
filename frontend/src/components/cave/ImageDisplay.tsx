'use client';

import ImageWithFallback from '@/components/image/ImageWithFallback';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface ImageDisplayProps {
  image: any;
  cave: any;
  floorNumber: number;
}

export default function ImageDisplay({ image, cave, floorNumber }: ImageDisplayProps) {
  // Check if image exists and has a valid image_url
  if (!image || !image.image_url || image.image_url.trim() === '') {
    return (
      <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
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
    <div className="relative w-full">
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <ImageWithFallback
          src={fullImageUrl}
          alt={image.subject || `Cave image ${image.id}`}
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

