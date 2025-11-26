'use client';

import ImageWithFallback from '@/components/image/ImageWithFallback';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface ImageDisplayProps {
  image: any;
  cave: any;
  floorNumber: number;
}

export default function ImageDisplay({ image, cave, floorNumber }: ImageDisplayProps) {
  if (!image) {
    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
        <div className="text-gray-500 text-center p-8">
          <p>Select an image to view</p>
        </div>
      </div>
    );
  }

  const fullImageUrl = `${IMAGE_BASE_URL}${image.image_url}`;

  return (
    <div className="relative">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <ImageWithFallback
          src={fullImageUrl}
          alt={image.subject || `Cave image ${image.id}`}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Caption below image */}
      {(image.subject || image.description) && (
        <div className="mt-4 text-[#eae2c4]">
          {image.subject && (
            <h3 className="text-lg font-semibold mb-2">{image.subject}</h3>
          )}
          {image.description && (
            <p className="text-sm leading-relaxed">{image.description}</p>
          )}
        </div>
      )}

      {/* Image ID and filename */}
      <div className="mt-2 text-xs text-gray-600">
        <p>
          {image.id} ({image.file_path})
        </p>
      </div>
    </div>
  );
}

