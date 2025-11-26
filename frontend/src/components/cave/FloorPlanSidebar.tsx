// components/cave/FloorPlanSidebar.tsx
'use client';

import ImageWithFallback from '@/components/image/ImageWithFallback';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

interface FloorPlanSidebarProps {
  floors: any[];
  selectedFloor: number;
  onSelectFloor: (floor: number) => void;
  caveId: string;
}

export default function FloorPlanSidebar({
  floors,
  selectedFloor,
  onSelectFloor,
  caveId
}: FloorPlanSidebarProps) {
  if (floors.length <= 1) return null;

  return (
    <div className="space-y-6">
      {floors.map((floor) => (
        <button
          key={floor.floor_number}
          onClick={() => onSelectFloor(floor.floor_number)}
          className={`block w-full text-center transition-opacity ${
            selectedFloor === floor.floor_number ? 'opacity-100' : 'opacity-60 hover:opacity-80'
          }`}
        >
          <div className="bg-black rounded-lg overflow-hidden mb-1 relative" style={{ aspectRatio: `${floor.plan_width}/${floor.plan_height}` }}>
            <ImageWithFallback
              src={`${IMAGE_BASE_URL}/images/plans/${floor.plan_image}`}
              alt={`Floor ${floor.floor_number}`}
              fill
              className="object-contain"
            />
          </div>
          <div className="text-sm text-[#eae2c4]">
            floor {floor.floor_number}
          </div>
        </button>
      ))}
    </div>
  );
}