/**
 * Cave card component displaying summary information for a single cave.
 * 
 * Shows cave number, name, tradition, date range, and image/floor counts.
 * Links to the detailed cave page.
 */

import Link from 'next/link';
import { Cave } from '@/lib/api';
import { Image, Layers } from 'lucide-react';

interface CaveCardProps {
  cave: Cave;
}

export default function CaveCard({ cave }: CaveCardProps) {
  const traditionColors = {
    Buddhist: 'bg-blue-100 text-blue-800',
    Hindu: 'bg-orange-100 text-orange-800',
    Jain: 'bg-green-100 text-green-800',
  };

  const colorClass = traditionColors[cave.tradition as keyof typeof traditionColors] || 'bg-gray-100 text-gray-800';

  return (
    <Link href={`/caves/${cave.cave_number}`} className="cave-card block">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Cave {cave.cave_number}
          </h3>
          {cave.name && cave.name !== `Cave ${cave.cave_number}` && (
            <p className="text-sm text-gray-600">{cave.name}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {cave.tradition}
        </span>
      </div>

      {cave.date_range && (
        <p className="text-sm text-gray-500 mb-3">{cave.date_range}</p>
      )}

      {cave.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {cave.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Image className="h-4 w-4" />
          <span>{cave.image_count} images</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          <span>{cave.floor_count} floor{cave.floor_count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}
