// components/cave/CaveMap.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CaveNumberMarker from './CaveNumberMarker';

interface CaveMapProps {
  selectedCaveId?: number;
  className?: string;
}

// Cave positions from the original cave_numbers.css
type CavePosition = {
  left: number;
  top: number;
  label?: string;
  fontSize?: string;
};

const CAVE_POSITIONS: Record<number, CavePosition> = {
  1: { left: 954, top: 157 },
  2: { left: 954, top: 140 },
  3: { left: 945, top: 125 },
  4: { left: 934, top: 112 },
  5: { left: 920, top: 108 },
  6: { left: 906, top: 117 },
  7: { left: 906, top: 107 },
  8: { left: 906, top: 97 },
  9: { left: 906, top: 87 },
  10: { left: 884, top: 101 },
  11: { left: 871, top: 98 },
  12: { left: 848, top: 90 },
  13: { left: 818, top: 100 },
  14: { left: 800, top: 99 },
  15: { left: 792, top: 68 },
  16: { left: 728, top: 70 },
  17: { left: 680, top: 75 },
  18: { left: 620, top: 75 },
  19: { left: 603, top: 74 },
  21: { left: 560, top: 74 },
  22: { left: 540, top: 74 },
  23: { left: 512, top: 80 },
  24: { left: 494, top: 77 },
  25: { left: 480, top: 63 },
  26: { left: 468, top: 53 },
  27: { left: 451, top: 43 },
  28: { left: 432, top: 40 },
  29: { left: 382, top: 69 },
  30: { left: 146, top: 47 },
  31: { left: 95, top: 110 },
  32: { left: 46, top: 120 },
  33: { left: 46, top: 142 },
  34: { left: 60, top: 165 },
  // Extra caves (right side list)
  1016: { left: 703, top: 62, label: '16L' },
  2016: { left: 684, top: 54, label: '16T' },
  3016: { left: 748, top: 80, label: '16ab' },
  4016: { left: 750, top: 95, label: '16s' },
  120: { left: 578, top: 64, label: '20b' },
  130: { left: 43, top: 99, label: '30a' },
  132: { left: 1000, top: 55, label: '32y' },
  124: { left: 494, top: 65, label: '24a1' },
  224: { left: 494, top: 53, label: '24a2' },
  10001: { left: 1000, top: 70, label: 'g1,2,3,4,5', fontSize: '80%' },
  10006: { left: 1000, top: 85, label: 'g6,7', fontSize: '80%' },
  10008: { left: 1000, top: 100, label: 'g8,9,10,11,12', fontSize: '80%' },
  10013: { left: 1000, top: 115, label: 'g13,14,15,16', fontSize: '80%' },
  10017: { left: 1000, top: 130, label: 'g17,18,19', fontSize: '80%' },
  20001: { left: 1000, top: 145, label: 'j1,2', fontSize: '80%' },
  20003: { left: 1000, top: 160, label: 'j3,4', fontSize: '80%' },
};

export default function CaveMap({ selectedCaveId, className = '' }: CaveMapProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Map background container - fixed aspect ratio based on 260x1024 */}
      <div className="relative w-full" style={{ aspectRatio: '1024/260' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/maps/map_260x1024px_gradient.png)',
          }}
        />
        
        {/* Cave number markers */}
        <div className="absolute inset-0">
          {Object.entries(CAVE_POSITIONS).map(([caveId, position]) => {
            const id = Number(caveId);
            const isSelected = selectedCaveId === id;
            const label = position.label || caveId;
            const isWhiteText = id === 16 || id === 30; // Original used white for these
            
            return (
              <Link
                key={caveId}
                href={`/explore?cave=${caveId}&floor=1`}
                className="absolute group"
                style={{
                  left: `${(position.left / 1024) * 100}%`,
                  top: `${(position.top / 260) * 100}%`,
                  fontSize: position.fontSize || '70%',
                }}
              >
                {/* Highlight marker for selected cave */}
                {isSelected && (
                  <div
                    className="absolute"
                    style={{
                      left: id < 10 ? '-10px' : '-11px',
                      top: id < 10 ? '-10px' : '-11px',
                    }}
                  >
                    <CaveNumberMarker size={id < 10 ? 20 : 22} />
                  </div>
                )}
                
                {/* Cave number/label */}
                <span
                  className={`
                    font-bold whitespace-nowrap transition-colors
                    ${isWhiteText ? 'text-white' : 'text-[#eae2c4]'}
                    ${isSelected ? 'text-[#6ebd20]' : ''}
                    group-hover:text-[#6ebd20]
                  `}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}