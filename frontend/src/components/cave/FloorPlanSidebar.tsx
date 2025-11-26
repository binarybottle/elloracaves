// components/cave/FloorPlanSidebar.tsx
'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';

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
          <div className="bg-gray-800 rounded-lg p-2 mb-1">
            <Layers className="h-12 w-12 mx-auto text-gray-400" />
          </div>
          <div className="text-sm text-[#eae2c4]">
            floor {floor.floor_number}
          </div>
        </button>
      ))}
    </div>
  );
}