// components/cave/ImageGalleryStrip.tsx
'use client';

import { History, Box, Star } from 'lucide-react';
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
}

export default function ImageGalleryStrip({
  images,
  archivalImages = [],
  selectedImageId,
  onImageSelect,
  cave,
  floorNumber,
  groupEditMode = false,
  multiSelectedIds,
  onToggleSelect,
  groupColorMap,
}: ImageGalleryStripProps) {
  const validImages = images.filter(img => img.image_url && img.image_url.trim() !== '');

  const groupedImages = getTreeOrderedImages(validImages);

  const sortedArchival = archivalImages
    .filter(img => !img.best_id && img.image_url && img.image_url.trim() !== '')
    .sort((a, b) => mediumRank(a.medium) - mediumRank(b.medium));

  const allImages = [...groupedImages, ...sortedArchival];

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
        {sortedArchival.length > 0 && (
          <span className="text-sm text-gray-500">
            {' '}&middot; {sortedArchival.length} archival
          </span>
        )}
        {groupEditMode && (
          <span className="text-sm text-purple-400 ml-2">
            GROUP EDIT
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allImages.map((image, idx) => {
          const isArchival = image.archival === true;
          const hasCoordinates = image.coordinates?.plan_x_norm !== null && 
                                 image.coordinates?.plan_x_norm !== undefined &&
                                 image.coordinates?.plan_y_norm !== null && 
                                 image.coordinates?.plan_y_norm !== undefined;
          
          const thumbnailUrl = image.thumbnail_url || image.image_url;
          const prevIsRegular = idx > 0 && !allImages[idx - 1].archival;
          const showSeparator = isArchival && (idx === 0 || prevIsRegular);

          const isMultiSelected = groupEditMode && multiSelectedIds?.has(image.id);
          const groupInfo = groupEditMode ? groupColorMap?.get(image.id) : undefined;
          const isGroupRoot = groupInfo && groupInfo.rootId === image.id;

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
              >
                <div className={`relative h-full rounded ${
                  isMultiSelected ? 'ring-2 ring-purple-400' :
                  selectedImageId === image.id ? 'ring-2 ring-red-600' : ''
                } ${isArchival ? 'opacity-75 hover:opacity-100' : ''}`}
                  style={groupEditMode && groupInfo ? { borderBottom: `3px solid ${groupInfo.color}` } : undefined}
                >
                  <img
                    src={thumbnailUrl}
                    alt={image.subject || `Image ${image.id}`}
                    className="h-full w-auto object-contain rounded"
                    loading="lazy"
                  />
                  {hasCoordinates && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[#6ebd20] rounded-full border border-white shadow-sm" />
                  )}
                  {image.archival_ids && image.archival_ids.length > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/60 rounded-sm p-px">
                      <History className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                  )}
                  {image.model3d_ids && image.model3d_ids.length > 0 && (
                    <div className="absolute bottom-1 left-1 bg-black/60 rounded-sm p-px">
                      <Box className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                  )}
                  {groupEditMode && isGroupRoot && (
                    <div className="absolute top-1 left-1 bg-black/60 rounded-sm p-px">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
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
