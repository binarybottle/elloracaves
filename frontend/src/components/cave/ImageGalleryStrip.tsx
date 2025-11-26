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
  return (
    <div className="bg-gray-900/50 rounded-lg p-6">
      <div className="mb-4 text-[#eae2c4]">
        <span className="text-lg">
          {images.length} result{images.length !== 1 ? 's' : ''}
        </span>
        {cave && (
          <span className="text-sm">
            {' '}in <strong>{cave.name}</strong>
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onImageSelect(image)}
            className={`flex-shrink-0 relative ${
              selectedImageId === image.id ? 'ring-2 ring-[#6ebd20]' : ''
            }`}
          >
            <ImageWithFallback
              src={`${IMAGE_BASE_URL}${image.thumbnail_url || image.image_url}`}
              alt={image.subject || `Image ${image.id}`}
              width={120}
              height={100}
              className="object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
}