/**
 * Cave grid component displaying caves in a responsive grid layout.
 * 
 * Allows filtering by religious tradition (Buddhist, Hindu, Jain) and
 * displays cave cards with key information.
 */

'use client';

import { useState } from 'react';
import { Cave } from '@/lib/api';
import CaveCard from './CaveCard';

interface CaveGridProps {
  caves: Cave[];
}

export default function CaveGrid({ caves }: CaveGridProps) {
  const [traditionFilter, setTraditionFilter] = useState<string | null>(null);

  const filteredCaves = traditionFilter
    ? caves.filter(cave => cave.tradition === traditionFilter)
    : caves;

  const traditions = Array.from(new Set(caves.map(c => c.tradition))).sort();

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTraditionFilter(null)}
          className={`px-4 py-2 rounded-md transition-colors ${
            traditionFilter === null
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Caves ({caves.length})
        </button>
        {traditions.map(tradition => {
          const count = caves.filter(c => c.tradition === tradition).length;
          return (
            <button
              key={tradition}
              onClick={() => setTraditionFilter(tradition)}
              className={`px-4 py-2 rounded-md transition-colors ${
                traditionFilter === tradition
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tradition} ({count})
            </button>
          );
        })}
      </div>

      {/* Cave Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaves.map(cave => (
          <CaveCard key={cave.id} cave={cave} />
        ))}
      </div>

      {filteredCaves.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No caves found for the selected filter.
        </div>
      )}
    </div>
  );
}
