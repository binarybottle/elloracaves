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
  const [planLoaded, setPlanLoaded] = useState(false);

  // Per-plan transforms.
  // sx/sy: scale the floor plan image. tx/ty: translate the image in px (origin: top-left).
  // mx/my: shift ALL markers for this plan, in normalized units (0–1).
  //   Positive mx moves markers right; positive my moves markers down.
  //   Example: mx: 0.05 shifts every marker 5% to the right.
  // spx/spy: scale marker positions from the top-left corner (origin 0,0).
  //   1.0 = no change; >1 stretches markers outward; <1 compresses them inward.
  //   Applied before mx/my: final_x = plan_x_norm * spx + mx
  const planTransforms: Record<number, { sx: number; sy: number; tx: number; ty: number; mx?: number; my?: number; spx?: number; spy?: number }> = {
    2:   { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .7, spy: .71 }, // Cave 2
    124: { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0.13, my: 0, spx: .6, spy: .9 }, // Cave 24 A1 (shrine 1)
    224: { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .94, spy: .93 }, // Cave 24 A2 (shrine 2)
    30:  { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .79, spy: .79 }, // Cave 30
    130: { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .75, spy: .75 }, // Cave 30a
    32:  { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .71, spy: .71 }, // Cave 32 floor 1
    232: { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .97, spy: .96 }, // Cave 32 floor 2
    34:  { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: .72, spy: .72 }, // Cave 34
  };
  const transform = planTransforms[plan.id] || { sx: 1, sy: 1, tx: 0, ty: 0, mx: 0, my: 0, spx: 1, spy: 1 };

  const imagesWithCoords = images.filter(
    (img) =>
      img.image_url &&
      img.image_url.trim() !== '' &&
      img.coordinates?.plan_x_norm !== null &&
      img.coordinates?.plan_x_norm !== undefined &&
      img.coordinates?.plan_y_norm !== null &&
      img.coordinates?.plan_y_norm !== undefined &&
      !img.hide_plan_xy
  );

  // Use plan_url from API (already includes full path) or construct it
  const planImageUrl = plan.plan_url || getPlanImageUrl(plan.plan_image);

  return (
    <div className="relative flex flex-col">
      <div
        className="relative bg-black rounded-lg overflow-hidden max-h-[calc(100vh-10rem)]"
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
          style={{
            transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.sx}, ${transform.sy})`,
            transformOrigin: 'top left',
          }}
          onLoad={() => setPlanLoaded(true)}
        />

        {/* Image Markers */}
        {planLoaded &&
          imagesWithCoords.map((img) => {
            const x = (img.coordinates!.plan_x_norm! * (transform.spx ?? 1) + (transform.mx ?? 0)) * 100;
            const y = (img.coordinates!.plan_y_norm! * (transform.spy ?? 1) + (transform.my ?? 0)) * 100;
            const isHovered = false; // We track hover via onImageHover callback now
            const isSelected = selectedImageId === img.id;

            return (
              <button
                key={img.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  zIndex: isSelected ? 20 : 10,
                }}
                onMouseEnter={() => {
                  onImageHover?.(img);
                }}
                onMouseLeave={() => {
                  onImageHover?.(null);
                }}
                onClick={() => onImageSelect(img)}
              >
                <div
                  className={`relative ${
                    isSelected ? 'scale-125' : 'scale-100'
                  } transition-transform hover:scale-150`}
                >
                  {/* Marker icon - green with white center when unselected, solid red when selected */}
                  {isSelected ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-md" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6ebd20] shadow-md flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
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
