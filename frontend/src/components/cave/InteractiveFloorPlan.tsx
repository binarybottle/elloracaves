'use client';

import { useState } from 'react';
import ImageWithFallback from '@/components/image/ImageWithFallback';
import { MapPin, Loader2 } from 'lucide-react';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface Coordinates {
  plan_x_px?: number;
  plan_y_px?: number;
  plan_x_norm?: number;
  plan_y_norm?: number;
}

interface ImageType {
  id: number;
  file_path: string;
  subject?: string;
  description?: string;
  coordinates?: Coordinates;
  image_url: string;
  thumbnail_url: string;
}

interface Plan {
  id: number;
  floor_number: number;
  plan_image: string;
  plan_width: number;
  plan_height: number;
  image_count: number;
}

interface InteractiveFloorPlanProps {
  plan: Plan;
  images: ImageType[];
  selectedImageId?: number;
  onImageSelect: (image: ImageType) => void;
}

export default function InteractiveFloorPlan({
  plan,
  images,
  selectedImageId,
  onImageSelect,
}: InteractiveFloorPlanProps) {
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  const imagesWithCoords = images.filter(
    (img) =>
      img.image_url &&
      img.image_url.trim() !== '' &&
      img.coordinates?.plan_x_norm !== null &&
      img.coordinates?.plan_x_norm !== undefined &&
      img.coordinates?.plan_y_norm !== null &&
      img.coordinates?.plan_y_norm !== undefined
  );

  const planImageUrl = `${IMAGE_BASE_URL}/images/plans/${plan.plan_image}`;

  return (
    <div className="relative flex flex-col">
      <div
        className="relative bg-black rounded-lg overflow-hidden"
        style={{ aspectRatio: `${plan.plan_width}/${plan.plan_height}` }}
      >
        {/* Loading Spinner */}
        {!planLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-[#487a14] animate-spin" />
          </div>
        )}

        {/* Floor Plan Image */}
        <ImageWithFallback
          src={planImageUrl}
          alt={`Floor ${plan.floor_number} plan`}
          fill
          className="object-contain"
          onLoad={() => setPlanLoaded(true)}
        />

        {/* Image Markers */}
        {planLoaded &&
          imagesWithCoords.map((img) => {
            const x = (img.coordinates!.plan_x_norm! * 100);
            const y = (img.coordinates!.plan_y_norm! * 100);
            const isHovered = hoveredImageId === img.id;
            const isSelected = selectedImageId === img.id;

            return (
              <button
                key={img.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  zIndex: isHovered || isSelected ? 20 : 10,
                }}
                onMouseEnter={() => setHoveredImageId(img.id)}
                onMouseLeave={() => setHoveredImageId(null)}
                onClick={() => onImageSelect(img)}
              >
                <div
                  className={`relative ${
                    isHovered || isSelected ? 'scale-125' : 'scale-100'
                  } transition-transform`}
                >
                  {/* Marker icon - green with white center when unselected, solid red when selected */}
                  {isSelected ? (
                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-lg" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#6ebd20] shadow-lg flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                  )}
                  
                  {/* Tooltip on hover/select - positioned to avoid cutoff */}
                  {(isHovered || isSelected) && img.subject && (
                    <div className="fixed bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg border border-gray-700 max-w-xs pointer-events-none"
                      style={{
                        left: `${Math.min(Math.max(x, 10), 90)}%`,
                        top: `${Math.min(y + 5, 85)}%`
                      }}
                    >
                      {img.subject}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>
          {imagesWithCoords.length} of {images.length} images positioned on plan
        </p>
      </div>
    </div>
  );
}

