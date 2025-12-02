'use client';

import { Image as ImageType } from '@/lib/api';

interface ImageDisplayProps {
  image: ImageType | null;
  cave: any;
  floorNumber: number;
}

export default function ImageDisplay({ image, cave, floorNumber }: ImageDisplayProps) {
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
  // (either Cloudflare Images or fallback local URL)
  const fullImageUrl = image.image_url;

  return (
    <div className="relative w-full">
      <div className="relative bg-black rounded-lg overflow-hidden w-full">
        <img
          src={fullImageUrl}
          alt={image.subject || `Cave image ${image.id}`}
          className="w-full h-auto object-contain max-h-[calc(100vh-300px)]"
          loading="lazy"
        />
      </div>
    </div>
  );
}
