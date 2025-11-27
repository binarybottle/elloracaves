// components/cave/CaveMap.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import CaveNumberMarker from './CaveNumberMarker';

interface CaveMapProps {
  selectedCaveId?: number;
  className?: string;
}

  // Cave positions from the original cave_numbers.css
  const OFFSET_X = 25;    // pixels right for fine-tuning
  const OFFSET_Y = 54;    // pixels down for fine-tuning
  const SCALE_X = 1.0;    // horizontal scaling factor
  const SCALE_Y = 1.0;    // vertical scaling factor

type CavePosition = {
  left: number;
  top: number;
  label?: string;
  fontSize?: string;
  extraCave?: boolean; // for right-side list
  highlight?: boolean; // show circle behind number
};

const CAVE_POSITIONS: Record<number, CavePosition> = {
  1: { left: (954 * SCALE_X) + OFFSET_X, top: (157 * SCALE_Y) + OFFSET_Y},
  2: { left: (954 * SCALE_X) + OFFSET_X, top: (142 * SCALE_Y) + OFFSET_Y, highlight: true },
  3: { left: (945 * SCALE_X) + OFFSET_X, top: (125 * SCALE_Y) + OFFSET_Y},
  4: { left: (934 * SCALE_X) + OFFSET_X, top: (112 * SCALE_Y) + OFFSET_Y},
  5: { left: (920 * SCALE_X) + OFFSET_X, top: (108 * SCALE_Y) + OFFSET_Y, highlight: true },
  6: { left: (907 * SCALE_X) + OFFSET_X, top: (116 * SCALE_Y) + OFFSET_Y},
  7: { left: (907 * SCALE_X) + OFFSET_X, top: (107 * SCALE_Y) + OFFSET_Y},
  8: { left: (907 * SCALE_X) + OFFSET_X, top: (98 * SCALE_Y) + OFFSET_Y},
  9: { left: (907 * SCALE_X) + OFFSET_X, top: (89 * SCALE_Y) + OFFSET_Y},
  10: { left: (892 * SCALE_X) + OFFSET_X, top: (120 * SCALE_Y) + OFFSET_Y, highlight: true },
  11: { left: (879 * SCALE_X) + OFFSET_X, top: (98 * SCALE_Y) + OFFSET_Y, highlight: true },
  12: { left: (848 * SCALE_X) + OFFSET_X, top: (88 * SCALE_Y) + OFFSET_Y, highlight: true },
  13: { left: (822 * SCALE_X) + OFFSET_X, top: (102 * SCALE_Y) + OFFSET_Y},
  14: { left: (803 * SCALE_X) + OFFSET_X, top: (98 * SCALE_Y) + OFFSET_Y, highlight: true },
  15: { left: (792 * SCALE_X) + OFFSET_X, top: (66 * SCALE_Y) + OFFSET_Y, highlight: true },
  16: { left: (728 * SCALE_X) + OFFSET_X, top: (70 * SCALE_Y) + OFFSET_Y, highlight: true },
  17: { left: (680 * SCALE_X) + OFFSET_X, top: (73 * SCALE_Y) + OFFSET_Y},
  18: { left: (621 * SCALE_X) + OFFSET_X, top: (75 * SCALE_Y) + OFFSET_Y},
  19: { left: (605 * SCALE_X) + OFFSET_X, top: (74 * SCALE_Y) + OFFSET_Y},
  21: { left: (560 * SCALE_X) + OFFSET_X, top: (74 * SCALE_Y) + OFFSET_Y, highlight: true },
  22: { left: (541 * SCALE_X) + OFFSET_X, top: (75 * SCALE_Y) + OFFSET_Y},
  23: { left: (512 * SCALE_X) + OFFSET_X, top: (80 * SCALE_Y) + OFFSET_Y},
  24: { left: (497 * SCALE_X) + OFFSET_X, top: (77 * SCALE_Y) + OFFSET_Y},
  25: { left: (477 * SCALE_X) + OFFSET_X, top: (62 * SCALE_Y) + OFFSET_Y},
  26: { left: (467 * SCALE_X) + OFFSET_X, top: (50 * SCALE_Y) + OFFSET_Y},
  27: { left: (451 * SCALE_X) + OFFSET_X, top: (42 * SCALE_Y) + OFFSET_Y},
  28: { left: (432 * SCALE_X) + OFFSET_X, top: (39 * SCALE_Y) + OFFSET_Y},
  29: { left: (384 * SCALE_X) + OFFSET_X, top: (68 * SCALE_Y) + OFFSET_Y, highlight: true },
  30: { left: (146 * SCALE_X) + OFFSET_X, top: (45 * SCALE_Y) + OFFSET_Y},
  31: { left: (95 * SCALE_X) + OFFSET_X, top: (110 * SCALE_Y) + OFFSET_Y},
  32: { left: (42 * SCALE_X) + OFFSET_X, top: (122 * SCALE_Y) + OFFSET_Y, highlight: true },
  33: { left: (43 * SCALE_X) + OFFSET_X, top: (143 * SCALE_Y) + OFFSET_Y, highlight: true },
  34: { left: (58 * SCALE_X) + OFFSET_X, top: (165 * SCALE_Y) + OFFSET_Y, highlight: true },
  // Satellite shrines and additional caves - on the map
  1016: { left: (700 * SCALE_X) + OFFSET_X, top: (62 * SCALE_Y) + OFFSET_Y, label: '16L', highlight: true },
  2016: { left: (698 * SCALE_X) + OFFSET_X, top: (46 * SCALE_Y) + OFFSET_Y, label: '16n'},
  3016: { left: (752 * SCALE_X) + OFFSET_X, top: (83 * SCALE_Y) + OFFSET_Y, label: '16se'},
  4016: { left: (753 * SCALE_X) + OFFSET_X, top: (95 * SCALE_Y) + OFFSET_Y, label: '16sw'},
  120: { left: (583 * SCALE_X) + OFFSET_X, top: (76 * SCALE_Y) + OFFSET_Y, label: '20a'},
  124: { left: (502 * SCALE_X) + OFFSET_X, top: (65 * SCALE_Y) + OFFSET_Y, label: '24a1'},
  224: { left: (502 * SCALE_X) + OFFSET_X, top: (53 * SCALE_Y) + OFFSET_Y, label: '24a2'},
  130: { left: (43 * SCALE_X) + OFFSET_X, top: (99 * SCALE_Y) + OFFSET_Y, label: '30a', highlight: true },
  // Extra caves (dropdown only) - positioned separately
  132: { left: 1000, top: 55, label: '32 Yadavas', extraCave: true },
  10001: { left: 1000, top: 70, label: 'Ganeshleni 1-5', extraCave: true },
  10006: { left: 1000, top: 85, label: 'Ganeshleni 6-7', extraCave: true },
  10008: { left: 1000, top: 100, label: 'Ganeshleni 8-12', extraCave: true },
  10013: { left: 1000, top: 115, label: 'Ganeshleni 13-16', extraCave: true },
  10017: { left: 1000, top: 130, label: 'Ganeshleni 17-19', extraCave: true },
  20001: { left: 1000, top: 145, label: 'Jogeshwari 1-2', extraCave: true },
  20003: { left: 1000, top: 160, label: 'Jogeshwari 3-4', extraCave: true },
};

export default function CaveMap({ selectedCaveId, className = '' }: CaveMapProps) {
  // Separate extra caves from main map caves
  const extraCaves = Object.entries(CAVE_POSITIONS).filter(([_, pos]) => pos.extraCave);
  const mainCaves = Object.entries(CAVE_POSITIONS).filter(([_, pos]) => !pos.extraCave);
  
  // Favorite caves to show first in dropdown (most important/popular caves)
  const favoriteOrder = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1016,4016,3016,2016,17,18,19,120,220,21,22,23,24,124,224,25,26,27,28,29,30,130,31,32,33,34,10001,10006,10008,10013,10017,20001,20003];
  
  // All caves for dropdown (favorites first, then numerical order)
  const allCaves = [...mainCaves, ...extraCaves].sort((a, b) => {
    const idA = Number(a[0]);
    const idB = Number(b[0]);
    
    const indexA = favoriteOrder.indexOf(idA);
    const indexB = favoriteOrder.indexOf(idB);
    
    // If both in favorites, sort by favorite order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A is favorite, it comes first
    if (indexA !== -1) return -1;
    // If only B is favorite, it comes first
    if (indexB !== -1) return 1;
    // Neither is favorite, sort numerically
    return idA - idB;
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Map container with aspect ratio wrapper */}
      <div className="relative flex-1">
        {/* Aspect ratio container that exactly matches the image */}
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: `${(260 / 1024) * 100}%` }}>
          {/* Map image positioned absolutely within aspect ratio container */}
          <div className="absolute inset-0">
            <Image
              src="/images/maps/map_260x1024px_gradient.png"
              alt="Ellora Caves Map"
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
            
            {/* Cave number markers - positioned relative to the same container as image */}
            {mainCaves.map(([caveId, position]) => {
              const id = Number(caveId);
              const isSelected = selectedCaveId === id;
              const label = position.label || caveId;
              const isWhiteText = (id === 16 || id === 30) && !isSelected; // White unless selected
              
              return (
                <Link
                  key={caveId}
                  href={`/explore?cave=${caveId}&floor=1`}
                  className="absolute group transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${(position.left / 1024) * 100}%`,
                    top: `${(position.top / 260) * 100}%`,
                  }}
                >
                  {/* Circle background for highlighted caves */}
                  {position.highlight && (
                    <svg
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                    >
                      <circle
                        cx="10"
                        cy="13"
                        r="8"
                        fill="white"
                        opacity="0.9"
                      />
                    </svg>
                  )}
                  {/* Cave number/label - green by default, white for specific caves, red when selected */}
                  <span
                    className={`
                      relative font-bold whitespace-nowrap transition-colors
                      ${isWhiteText ? 'text-white' : isSelected ? 'text-red-600' : 'text-black'}
                      group-hover:text-red-600
                    `}
                    style={{
                      fontSize: position.fontSize || '0.5rem',
                    }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Cave Selector Dropdown - positioned in top right of map */}
        <div className="absolute top-4 right-4 z-20">
          <select
            value={selectedCaveId}
            onChange={(e) => {
              const caveId = e.target.value;
              window.location.href = `/explore?cave=${caveId}&floor=1`;
            }}
            className="
              bg-black text-white border-2 border-gray-600 
              rounded-lg px-4 py-2 text-base font-bold
              hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-gray-400
              cursor-pointer shadow-lg
              transition-all duration-200
            "
          >
            <option value="" disabled className="bg-black text-gray-500">
              Select a cave...
            </option>
            {allCaves.map(([caveId, position]) => {
              const id = Number(caveId);
              const label = position.label || `Cave ${caveId}`;
              const displayLabel = position.label ? label : `Cave ${caveId}`;
              
              return (
                <option 
                  key={caveId} 
                  value={caveId}
                  className="bg-black text-white py-2"
                >
                  {displayLabel}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}