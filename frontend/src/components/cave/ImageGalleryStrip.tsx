// components/cave/ImageGalleryStrip.tsx
'use client';

import { useState } from 'react';
import { History, Box, Star, BookOpen } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';
import { getTreeOrderedImages, GroupInfo } from '@/lib/group-colors';

const MEDIUM_ORDER: Record<string, number> = {
  photograph: 0, photo: 0,
  etching: 1,
  aquatint: 2,
  painting: 3,
};

function mediumRank(medium?: string): number {
  if (!medium) return 99;
  const key = medium.toLowerCase();
  for (const [k, v] of Object.entries(MEDIUM_ORDER)) {
    if (key.includes(k)) return v;
  }
  return 98;
}

interface ImageGalleryStripProps {
  images: ImageType[];
  archivalImages?: ImageType[];
  selectedImageId?: number;
  onImageSelect: (image: ImageType) => void;
  cave: any;
  floorNumber: number;
  groupEditMode?: boolean;
  multiSelectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
  groupColorMap?: Map<number, GroupInfo>;
  onUpdateRank?: (imageId: number, rank: number) => void;
  onToggleHidePlanXY?: (imageId: number, currentValue: boolean) => void;
}

export default function ImageGalleryStrip({
  images,
  archivalImages = [],
  selectedImageId,
  onImageSelect,
  cave,
  groupEditMode = false,
  multiSelectedIds,
  onToggleSelect,
  groupColorMap,
  onUpdateRank,
  onToggleHidePlanXY,
}: ImageGalleryStripProps) {
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState('');
  // In non-edit mode, only display rank-1 images; rank-2 alternates are included
  // in `combined` below so that idsReferencedAsBest can identify group roots.
  const validImages = images.filter(img => img.image_url && img.image_url.trim() !== ''
    && (groupEditMode || img.rank === 1));

  // combined includes rank-2 images too (needed for group-root detection)
  const allValid = images.filter(img => img.image_url && img.image_url.trim() !== '');
  const seenIds = new Set(allValid.map(img => img.id));
  const extraArchival = archivalImages.filter(img => !seenIds.has(img.id) && img.image_url && img.image_url.trim() !== '');
  const combined = [...allValid, ...extraArchival];

  // Tree-order places grouped images together (including grouped archival);
  // ungrouped archival images end up as roots and land where DFS puts them.
  const treeOrdered = getTreeOrderedImages(combined);

  // Which image IDs are referenced as best_id by another image in this set —
  // used to identify group roots in non-edit mode (groupColorMap isn't built then).
  const combinedIdSet = new Set(combined.map(img => img.id));
  const idsReferencedAsBest = new Set<number>();
  combined.forEach(img => {
    if (img.best_id && combinedIdSet.has(img.best_id)) {
      idsReferencedAsBest.add(img.best_id);
    }
  });

  // Split: ungrouped archival at the end, everything else in tree order.
  // In non-edit mode, rank-2 alternates are excluded from display.
  const mainImages: ImageType[] = [];
  const ungroupedArchival: ImageType[] = [];
  treeOrdered.forEach(img => {
    if (!groupEditMode && img.rank !== 1) return;
    if (img.archival && !img.best_id) {
      ungroupedArchival.push(img);
    } else {
      mainImages.push(img);
    }
  });
  ungroupedArchival.sort((a, b) => mediumRank(a.medium) - mediumRank(b.medium));

  const allImages = [...mainImages, ...ungroupedArchival];

  return (
    <div className="bg-black p-6">
      <div className="mb-4 text-[#eae2c4]">
        <span className="text-base">
          {validImages.length} result{validImages.length !== 1 ? 's' : ''}
        </span>
        {cave && (
          <span className="text-sm">
            {' '}in <strong>{cave.name}</strong>
          </span>
        )}
        {ungroupedArchival.length > 0 && (
          <span className="text-sm text-gray-500">
            {' '}&middot; {ungroupedArchival.length} archival
          </span>
        )}
        {groupEditMode && (
          <span className="text-sm text-purple-400 ml-2">
            EDIT MODE
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allImages.map((image, idx) => {
          const isArchival = image.archival === true;
          const hasCoordinates =
            (image.coordinates?.plan_x_norm != null && image.coordinates?.plan_y_norm != null) ||
            (image.mx != null && image.my != null);
          
          const thumbnailUrl = image.thumbnail_url || image.image_url;
          const showSeparator = idx === mainImages.length && ungroupedArchival.length > 0;

          const isMultiSelected = groupEditMode && multiSelectedIds?.has(image.id);
          const groupInfo = groupEditMode ? groupColorMap?.get(image.id) : undefined;
          const isGroupRoot = groupEditMode
            ? (groupInfo != null && groupInfo.rootId === image.id)
            : idsReferencedAsBest.has(image.id);

          const handleClick = () => {
            if (groupEditMode && onToggleSelect) {
              onToggleSelect(image.id);
            } else {
              onImageSelect(image);
            }
          };

          return (
            <div key={image.id} className="flex items-start gap-2">
              {showSeparator && (
                <div className="self-stretch w-px bg-gray-700 mx-1" />
              )}
              <button
                onClick={handleClick}
                className="relative block h-24 flex-shrink-0"
                style={groupEditMode && groupInfo && !isMultiSelected ? {
                  outline: `2px solid ${groupInfo.color}`,
                  outlineOffset: '1px',
                  borderRadius: '4px',
                } : undefined}
              >
                <div className={`relative h-full rounded ${
                  isMultiSelected ? 'ring-2 ring-purple-400' :
                  selectedImageId === image.id ? 'ring-2 ring-red-600' : ''
                } ${isArchival ? 'opacity-75 hover:opacity-100' : ''}`}
                >
                  <img
                    src={thumbnailUrl}
                    alt={image.subject || `Image ${image.id}`}
                    className="h-full w-auto object-contain rounded"
                    loading="lazy"
                  />
                  {groupEditMode && hasCoordinates && onToggleHidePlanXY ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleHidePlanXY(image.id, image.hide_plan_xy || false); }}
                      className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                        image.hide_plan_xy ? 'bg-gray-500' : 'bg-[#6ebd20]'
                      }`}
                      title={image.hide_plan_xy ? 'Landmark hidden — click to show' : 'Landmark shown — click to hide'}
                    />
                  ) : hasCoordinates ? (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[#6ebd20] rounded-full border border-white shadow-sm" />
                  ) : null}
                  {groupEditMode && onUpdateRank && (
                    editingRankId === image.id ? (
                      <form
                        className="absolute top-1 left-1 z-10"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = parseInt(rankInput, 10);
                          if (!isNaN(val)) onUpdateRank(image.id, val);
                          setEditingRankId(null);
                        }}
                      >
                        <input
                          type="number"
                          value={rankInput}
                          onChange={(e) => setRankInput(e.target.value)}
                          className="w-8 bg-gray-800 text-white text-[10px] text-center rounded border border-gray-600 px-0.5 py-0"
                          autoFocus
                          onBlur={() => setEditingRankId(null)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </form>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRankId(image.id);
                          setRankInput(String(image.rank));
                        }}
                        className={`absolute top-1 left-1 z-10 text-[10px] font-bold px-1 py-0 rounded hover:bg-white transition-colors leading-tight ${
                          isGroupRoot ? 'bg-yellow-300 text-black' : 'bg-white/90 text-black'
                        }`}
                        title={`Rank ${image.rank}${isGroupRoot ? ' (group best)' : ''} — click to edit`}
                      >
                        {isGroupRoot && '★'}{image.rank}
                      </button>
                    )
                  )}
                  {!groupEditMode && isGroupRoot && (
                    <div className="absolute top-1 left-1 bg-black/60 rounded-sm p-px">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-0.5">
                    {(image.book_page != null || image.book_figure != null) && (
                      <div className="bg-black/60 rounded-sm p-px">
                        <BookOpen className="w-2.5 h-2.5 text-orange-300" />
                      </div>
                    )}
                    {image.archival_ids && image.archival_ids.length > 0 && (
                      <div className="bg-black/60 rounded-sm p-px">
                        <History className="w-2.5 h-2.5 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {image.model3d_ids && image.model3d_ids.length > 0 && (
                    <div className="absolute bottom-1 left-1 bg-black/60 rounded-sm p-px">
                      <Box className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                  )}
                  {groupEditMode && groupInfo && (
                    <div
                      className="absolute bottom-0 left-0 text-[8px] font-bold px-1 rounded-tr-sm text-white leading-tight"
                      style={{ backgroundColor: groupInfo.color }}
                    >
                      {groupInfo.groupNumber}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
