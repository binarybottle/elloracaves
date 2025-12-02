// components/cave/FloorPlanSidebar.tsx
'use client';

import { FloorPlan } from '@/lib/api';
import { getPlanImageUrl } from '@/lib/cloudflare-images';

interface FloorPlanSidebarProps {
  floors: FloorPlan[];
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
      {floors.map((floor) => {
        // Use plan_url from API or construct it
        const planImageUrl = floor.plan_url || getPlanImageUrl(floor.plan_image);
        
        return (
          <button
            key={floor.floor_number}
            onClick={() => onSelectFloor(floor.floor_number)}
            className={`block w-full text-center transition-opacity ${
              selectedFloor === floor.floor_number ? 'opacity-100' : 'opacity-60 hover:opacity-80'
            }`}
          >
            <div 
              className="bg-black rounded-lg overflow-hidden mb-1 relative" 
              style={{ aspectRatio: `${floor.plan_width}/${floor.plan_height}` }}
            >
              <img
                src={planImageUrl}
                alt={`Floor ${floor.floor_number}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="text-sm text-[#eae2c4]">
              floor {floor.floor_number}
            </div>
          </button>
        );
      })}
    </div>
  );
}
