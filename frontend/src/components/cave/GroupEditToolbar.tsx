'use client';

import { useState } from 'react';
import { X, Group, Unlink, MapPin, Users, Star } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';
import { GroupInfo } from '@/lib/group-colors';

interface GroupEditToolbarProps {
  selectedIds: Set<number>;
  images: ImageType[];
  placingImageId: number | null;
  groupColorMap?: Map<number, GroupInfo>;
  onGroup: (bestId: number) => void;
  onUngroup: () => void;
  onSelectGroup: (imageId: number) => void;
  onChangeBest: (newBestId: number) => void;
  onClearSelection: () => void;
  onStartPlacing: (imageId: number) => void;
  onCancelPlacing: () => void;
}

export default function GroupEditToolbar({
  selectedIds,
  images,
  placingImageId,
  groupColorMap,
  onGroup,
  onUngroup,
  onSelectGroup,
  onChangeBest,
  onClearSelection,
  onStartPlacing,
  onCancelPlacing,
}: GroupEditToolbarProps) {
  const [pickingBest, setPickingBest] = useState(false);
  const [changingBest, setChangingBest] = useState(false);

  const selectedImages = images.filter(img => selectedIds.has(img.id));
  const count = selectedIds.size;

  if (count === 0 && !placingImageId) return null;

  // --- Placing mode ---
  if (placingImageId) {
    const img = images.find(i => i.id === placingImageId);
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-purple-500 rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-purple-200">
          Click on the floor plan to place <strong>#{placingImageId}</strong>
          {img?.subject && <span className="text-gray-400"> ({img.subject})</span>}
        </span>
        <button
          onClick={onCancelPlacing}
          className="ml-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    );
  }

  // --- Picking best for grouping ---
  if (pickingBest) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-purple-500 rounded-lg shadow-2xl p-4 max-w-[90vw]">
        <div className="text-sm text-purple-200 mb-3">Click the best image for this group:</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {selectedImages.map(img => (
            <button
              key={img.id}
              onClick={() => {
                onGroup(img.id);
                setPickingBest(false);
              }}
              className="relative flex-shrink-0 h-20 rounded hover:ring-2 hover:ring-yellow-400 transition-all"
            >
              <img
                src={img.thumbnail_url || img.image_url}
                alt={img.subject || `#${img.id}`}
                className="h-full w-auto object-contain rounded"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-gray-300 text-center py-0.5 rounded-b">
                #{img.id}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setPickingBest(false)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  // --- Changing best within an existing group ---
  if (changingBest) {
    // Show all members of the group (from current selection, which should be the whole group)
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-yellow-500 rounded-lg shadow-2xl p-4 max-w-[90vw]">
        <div className="text-sm text-yellow-200 mb-3">Click the new best image for this group:</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {selectedImages.map(img => {
            const isCurrentRoot = groupColorMap?.get(img.id)?.rootId === img.id;
            return (
              <button
                key={img.id}
                onClick={() => {
                  onChangeBest(img.id);
                  setChangingBest(false);
                }}
                className={`relative flex-shrink-0 h-20 rounded hover:ring-2 hover:ring-yellow-400 transition-all ${isCurrentRoot ? 'ring-2 ring-yellow-600' : ''}`}
              >
                <img
                  src={img.thumbnail_url || img.image_url}
                  alt={img.subject || `#${img.id}`}
                  className="h-full w-auto object-contain rounded"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-gray-300 text-center py-0.5 rounded-b">
                  #{img.id}{isCurrentRoot ? ' ★' : ''}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setChangingBest(false)}
          className="mt-2 text-xs text-gray-400 hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  // --- Default toolbar ---
  const singleSelected = count === 1 ? selectedImages[0] : null;
  const hasCoords = singleSelected && (singleSelected.coordinates?.plan_x_norm != null || singleSelected.mx != null);

  // Detect if the single selected image belongs to a group
  const singleGroupInfo = singleSelected ? groupColorMap?.get(singleSelected.id) : undefined;

  // Detect if the entire selection is exactly one group
  const selectionGroupRoots = new Set<number>();
  Array.from(selectedIds).forEach(id => {
    const gi = groupColorMap?.get(id);
    if (gi) selectionGroupRoots.add(gi.rootId);
  });
  const isWholeGroup = selectionGroupRoots.size === 1 && count >= 2;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3 flex-wrap justify-center">
      <span className="text-sm text-gray-300">
        {count} selected
      </span>

      <div className="w-px h-5 bg-gray-600" />

      {/* Select group -- shown when exactly 1 grouped image is selected */}
      {singleSelected && singleGroupInfo && (
        <button
          onClick={() => onSelectGroup(singleSelected.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded text-white transition-colors"
          style={{ backgroundColor: singleGroupInfo.color }}
        >
          <Users className="w-3.5 h-3.5" />
          Select group {singleGroupInfo.groupNumber}
        </button>
      )}

      {/* Group / re-group -- available with 2+ selected */}
      <button
        onClick={() => setPickingBest(true)}
        disabled={count < 2}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-purple-700 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors"
      >
        <Group className="w-3.5 h-3.5" />
        Group
      </button>

      {/* Change best -- available when selection is a single whole group */}
      {isWholeGroup && (
        <button
          onClick={() => setChangingBest(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-yellow-700 hover:bg-yellow-600 text-white transition-colors"
        >
          <Star className="w-3.5 h-3.5" />
          Change best
        </button>
      )}

      <button
        onClick={onUngroup}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
      >
        <Unlink className="w-3.5 h-3.5" />
        Ungroup
      </button>

      {singleSelected && !hasCoords && (
        <>
          <div className="w-px h-5 bg-gray-600" />
          <button
            onClick={() => onStartPlacing(singleSelected.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Place on plan
          </button>
        </>
      )}

      <div className="w-px h-5 bg-gray-600" />

      <button
        onClick={onClearSelection}
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
