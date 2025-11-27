// components/cave/ImageGalleryStrip.tsx
'use client';

import ImageWithFallback from '@/components/image/ImageWithFallback';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface ImageGalleryStripProps {
  images: any[];
  selectedImageId?: number;
  onImageSelect: (image: any) => void;
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
          
          return (
            <button
              key={image.id}
              onClick={() => onImageSelect(image)}
              className="relative block h-24 flex-shrink-0"
            >
              <div className={`relative h-full rounded ${
                selectedImageId === image.id ? 'ring-2 ring-red-600' : ''
              }`}>
                <ImageWithFallback
                  src={`${IMAGE_BASE_URL}${image.thumbnail_url || image.image_url}`}
                  alt={image.subject || `Image ${image.id}`}
                  width={120}
                  height={96}
                  className="h-full w-auto object-contain rounded"
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