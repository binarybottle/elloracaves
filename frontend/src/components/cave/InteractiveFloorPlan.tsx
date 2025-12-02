'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Image as ImageType, FloorPlan } from '@/lib/api';
import { getPlanImageUrl } from '@/lib/cloudflare-images';

interface InteractiveFloorPlanProps {
  plan: FloorPlan;
  images: ImageType[];
  selectedImageId?: number;
  onImageSelect: (image: ImageType) => void;
  onImageHover?: (image: ImageType | null) => void;
}

export default function InteractiveFloorPlan({
  plan,
  images,
  selectedImageId,
  onImageSelect,
  onImageHover,
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

  // Use plan_url from API (already includes full path) or construct it
  const planImageUrl = plan.plan_url || getPlanImageUrl(plan.plan_image);

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
        <img
          src={planImageUrl}
          alt={`Floor ${plan.floor_number} plan`}
          className="absolute inset-0 w-full h-full object-contain"
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
                onMouseEnter={() => {
                  setHoveredImageId(img.id);
                  onImageHover?.(img);
                }}
                onMouseLeave={() => {
                  setHoveredImageId(null);
                  onImageHover?.(null);
                }}
                onClick={() => onImageSelect(img)}
              >
                <div
                  className={`relative ${
                    isHovered || isSelected ? 'scale-125' : 'scale-100'
                  } transition-transform`}
                >
                  {/* Marker icon - green with white center when unselected, solid red when selected */}
                  {isSelected ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-md" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6ebd20] shadow-md flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  )}
                  
                  {/* No tooltip needed - image preview shows on hover */}
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
