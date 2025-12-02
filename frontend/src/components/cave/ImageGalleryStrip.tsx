// components/cave/ImageGalleryStrip.tsx
'use client';

import { Image as ImageType } from '@/lib/api';

interface ImageGalleryStripProps {
  images: ImageType[];
  selectedImageId?: number;
  onImageSelect: (image: ImageType) => void;
  cave: any;
  floorNumber: number;
}

export default function ImageGalleryStrip({
  images,
  selectedImageId,
  onImageSelect,
  cave,
  floorNumber
}: ImageGalleryStripProps) {
  const validImages = images.filter(img => img.image_url && img.image_url.trim() !== '');
  
  return (
    <div className="bg-black p-6">
      <div className="mb-4 text-[#eae2c4]">
        <span className="text-base">
          {validImages.length} result{validImages.length !== 1 ? 's' : ''}
        </span>
        {cave && (
          <span className="text-sm">
            {' '}in <strong>{cave.name}</strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {validImages.map((image) => {
          const hasCoordinates = image.coordinates?.plan_x_norm !== null && 
                                 image.coordinates?.plan_x_norm !== undefined &&
                                 image.coordinates?.plan_y_norm !== null && 
                                 image.coordinates?.plan_y_norm !== undefined;
          
          // Use thumbnail_url directly - already full URL from API
          const thumbnailUrl = image.thumbnail_url || image.image_url;
          
          return (
            <button
              key={image.id}
              onClick={() => onImageSelect(image)}
              className="relative block h-24 flex-shrink-0"
            >
              <div className={`relative h-full rounded ${
                selectedImageId === image.id ? 'ring-2 ring-red-600' : ''
              }`}>
                <img
                  src={thumbnailUrl}
                  alt={image.subject || `Image ${image.id}`}
                  className="h-full w-auto object-contain rounded"
                  loading="lazy"
                />
                {/* Green dot indicator for images with floor plan coordinates */}
                {hasCoordinates && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[#6ebd20] rounded-full border border-white shadow-sm" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
