'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Image as ImageType, FloorPlan } from '@/lib/api';
import { getPlanImageUrl } from '@/lib/cloudflare-images';

interface InteractiveFloorPlanProps {
  plan: FloorPlan;
  images: ImageType[];
  selectedImageId?: number;
  onImageSelect: (image: ImageType) => void;
  onImageHover?: (image: ImageType | null) => void;
  editMode?: boolean;
  onSaveMarkerPosition?: (imageId: number, x: number, y: number) => void;
}

interface DragState {
  imageId: number;
  x: number;
  y: number;
}

export default function InteractiveFloorPlan({
  plan,
  images,
  selectedImageId,
  onImageSelect,
  onImageHover,
  editMode = false,
  onSaveMarkerPosition,
}: InteractiveFloorPlanProps) {
  const jpgUrl = plan.plan_url || getPlanImageUrl(plan.plan_image);
  const svgUrl = jpgUrl.replace(/\.(jpg|png)$/, '.svg');

  const [planSrc, setPlanSrc] = useState(svgUrl);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [planDimensions, setPlanDimensions] = useState({ w: plan.plan_width, h: plan.plan_height });
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);

  useEffect(() => {
    const newSvg = (plan.plan_url || getPlanImageUrl(plan.plan_image)).replace(/\.(jpg|png)$/, '.svg');
    setPlanSrc(newSvg);
    setPlanLoaded(false);
    setPlanDimensions({ w: plan.plan_width, h: plan.plan_height });
  }, [plan.id, plan.plan_url, plan.plan_image, plan.plan_width, plan.plan_height]);

  const isSvg = planSrc.endsWith('.svg');

  // Per-plan marker transforms for images without corrected mx/my coordinates.
  // mx/my: translate all markers in normalized units (0–1). Positive = right/down.
  // spx/spy: scale marker positions from the top-left corner. 1.0 = no change.
  //   final_x = plan_x_norm * spx + mx
  const planTransforms: Record<number, { mx: number; my: number; spx: number; spy: number }> = {
    // Caves 1–9
    1:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 1
    2:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 2
    3:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 3
    4:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 4
    5:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 5
    6:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 6
    7:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 7
    8:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 8
    9:     { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 9
    // Cave 10
    10:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 10 floor 1
    210:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 10 floor 2
    // Cave 11
    11:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 11 floor 1
    211:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 11 floor 2
    311:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 11 floor 3
    // Cave 12
    12:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 12 floor 1
    212:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 12 floor 2
    312:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 12 floor 3
    // Caves 14–19
    14:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 14
    15:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 15 floor 1
    215:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 15 floor 2
    16:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 1
    216:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 2
    1216:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 2 Lankeshwar
    2016:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 1 triple-story
    2216:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 2 triple-story
    2316:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 floor 3 triple-story
    3016:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 BA
    4016:  { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 16 satellite
    17:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 17
    18:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 18
    19:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 19
    // Caves 20–29
    20:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 20A
    120:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 20B
    21:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 21
    22:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 22
    23:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 23
    24:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 24
    124:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 24 A1 (shrine 1)
    224:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 24 A2 (shrine 2)
    25:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 25
    26:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 26
    27:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 27
    28:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 28
    29:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 29
    // Caves 30–34
    30:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 30
    130:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 30a
    31:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 31
    32:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 32 floor 1
    132:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 32 Yadavas
    232:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 32 floor 2
    33:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 33 floor 1
    233:   { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 33 floor 2
    34:    { mx: 0, my: 0, spx: 1, spy: 1 }, // Cave 34
    // Ganeshleni group
    10001: { mx: 0, my: 0, spx: 1, spy: 1 }, // Ganeshleni 1–5
    10006: { mx: 0, my: 0, spx: 1, spy: 1 }, // Ganeshleni 6–7
    10008: { mx: 0, my: 0, spx: 1, spy: 1 }, // Ganeshleni 8–12
    10013: { mx: 0, my: 0, spx: 1, spy: 1 }, // Ganeshleni 13–16
    10017: { mx: 0, my: 0, spx: 1, spy: 1 }, // Ganeshleni 17–19
    // Jogeshwari group
    20001: { mx: 0, my: 0, spx: 1, spy: 1 }, // Jogeshwari 1–2
    20003: { mx: 0, my: 0, spx: 1, spy: 1 }, // Jogeshwari 3–4
  };
  const transform = planTransforms[plan.id] ?? { mx: 0, my: 0, spx: 1, spy: 1 };

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleMarkerPointerDown = useCallback((e: React.PointerEvent, imageId: number) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getRelativePosition(e.clientX, e.clientY);
    setDragging({ imageId, x, y });
  }, [editMode, getRelativePosition]);

  const handleContainerPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const { x, y } = getRelativePosition(e.clientX, e.clientY);
    setDragging(prev => prev ? { ...prev, x, y } : null);
  }, [dragging, getRelativePosition]);

  const handleContainerPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const { x, y } = getRelativePosition(e.clientX, e.clientY);
    wasDraggingRef.current = true;
    setSaving(dragging.imageId);
    onSaveMarkerPosition?.(dragging.imageId, x, y);
    setDragging(null);
    setTimeout(() => {
      wasDraggingRef.current = false;
      setSaving(null);
    }, 500);
  }, [dragging, getRelativePosition, onSaveMarkerPosition]);

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

  return (
    <div className="relative flex flex-col">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden max-h-[calc(100vh-10rem)]"
        style={{
          aspectRatio: `${planDimensions.w}/${planDimensions.h}`,
          cursor: dragging ? 'grabbing' : editMode ? 'default' : undefined,
        }}
        onPointerMove={editMode ? handleContainerPointerMove : undefined}
        onPointerUp={editMode ? handleContainerPointerUp : undefined}
        onPointerLeave={editMode ? handleContainerPointerUp : undefined}
      >
        {/* Edit mode banner — overlaid so it doesn't shift the container */}
        {editMode && (
          <div className="absolute top-0 inset-x-0 z-40 px-3 py-1 bg-amber-900/85 text-amber-200 text-xs flex items-center gap-2 pointer-events-none">
            <span className="font-semibold text-amber-400">EDIT MODE</span>
            <span>Drag markers to reposition. Saves automatically.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {!planLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-[#487a14] animate-spin" />
          </div>
        )}

        {/* Floor Plan Image */}
        <img
          src={planSrc}
          alt={`Floor ${plan.floor_number} plan`}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            filter: isSvg ? 'invert(1)' : undefined,
          }}
          onError={() => {
            setPlanSrc(jpgUrl);
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              setPlanDimensions({ w: img.naturalWidth, h: img.naturalHeight });
            }
            setPlanLoaded(true);
          }}
        />

        {/* Image Markers */}
        {planLoaded &&
          imagesWithCoords.map((img) => {
            const hasCustomPos = img.mx !== null && img.mx !== undefined;
            const isDraggingThis = dragging?.imageId === img.id;
            const isSavingThis = saving === img.id;
            const isSelected = selectedImageId === img.id;

            // Position: dragging override > corrected mx/my > original coords with planTransform
            let dispX: number, dispY: number;
            if (isDraggingThis && dragging) {
              dispX = dragging.x * 100;
              dispY = dragging.y * 100;
            } else if (hasCustomPos) {
              dispX = img.mx! * 100;
              dispY = (img.my ?? 0) * 100;
            } else {
              dispX = (img.coordinates!.plan_x_norm! * transform.spx + transform.mx) * 100;
              dispY = (img.coordinates!.plan_y_norm! * transform.spy + transform.my) * 100;
            }

            return (
              <button
                key={img.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${dispX}%`,
                  top: `${dispY}%`,
                  zIndex: isDraggingThis ? 30 : isSelected ? 20 : 10,
                  cursor: editMode ? (isDraggingThis ? 'grabbing' : 'grab') : undefined,
                  transition: isDraggingThis ? 'none' : undefined,
                }}
                onPointerDown={(e) => handleMarkerPointerDown(e, img.id)}
                onMouseEnter={() => { if (!dragging) onImageHover?.(img); }}
                onMouseLeave={() => { if (!dragging) onImageHover?.(null); }}
                onClick={() => {
                  if (wasDraggingRef.current) return;
                  if (!editMode) onImageSelect(img);
                }}
              >
                <div
                  className={`relative transition-transform ${
                    isDraggingThis ? 'scale-150' : isSelected ? 'scale-125' : 'scale-100'
                  } ${editMode && !isDraggingThis ? 'hover:scale-150' : ''}`}
                >
                  {isSelected && !editMode ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-md" />
                  ) : editMode && hasCustomPos ? (
                    // Repositioned marker: cyan
                    <div className={`w-1.5 h-1.5 rounded-full shadow-md flex items-center justify-center ${isSavingThis ? 'bg-yellow-400' : 'bg-cyan-400'}`}>
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6ebd20] shadow-md flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>

                {/* Label while dragging */}
                {isDraggingThis && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-black/80 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap pointer-events-none">
                    #{img.id}
                  </div>
                )}
              </button>
            );
          })}
      </div>

      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <p>
          {imagesWithCoords.length} of {images.length} images positioned on plan
        </p>
        {editMode && (
          <p className="text-cyan-600">
            {imagesWithCoords.filter(img => img.mx !== null && img.mx !== undefined).length} repositioned
          </p>
        )}
      </div>
    </div>
  );
}
