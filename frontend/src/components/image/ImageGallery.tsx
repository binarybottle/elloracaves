/**
 * Responsive image gallery component displaying image thumbnails.
 * 
 * Shows images in a grid with actual thumbnails from the backend.
 * Each thumbnail links to the full image detail page.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Image as ImageType } from '@/lib/api';

interface ImageGalleryProps {
  images: ImageType[];
}

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No images available for this floor.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
      {images.map(image => {
        // Use thumbnail if available, otherwise use full image
        const imageUrl = image.thumbnail_url || image.image_url;
        const fullImageUrl = `${IMAGE_BASE_URL}${imageUrl}`;

        return (
          <Link
            key={image.id}
            href={`/images/${image.id}`}
            className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <Image
                src={fullImageUrl}
                alt={image.subject || 'Cave image'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                unoptimized // Since images are served from FastAPI
              />
            </div>
            <div className="p-2">
              <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {image.subject || 'Untitled'}
              </p>
              {image.description && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {image.description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
