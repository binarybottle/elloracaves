// components/cave/ImageGalleryStrip.tsx
'use client';

import { History, Box } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';

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
}

export default function ImageGalleryStrip({
  images,
  archivalImages = [],
  selectedImageId,
  onImageSelect,
  cave,
  floorNumber
}: ImageGalleryStripProps) {
  const validImages = images.filter(img => img.image_url && img.image_url.trim() !== '');

  const groupedImages = (() => {
    const bestIdMap = new Map<number, ImageType[]>();
    const placed = new Set<number>();

    for (const img of validImages) {
      if (img.best_id) {
        const group = bestIdMap.get(img.best_id) || [];
        group.push(img);
        bestIdMap.set(img.best_id, group);
      }
    }

    const result: ImageType[] = [];
    for (const img of validImages) {
      if (placed.has(img.id)) continue;
      placed.add(img.id);
      result.push(img);
      const group = bestIdMap.get(img.id);
      if (group) {
        for (const g of group) {
          if (!placed.has(g.id)) {
            placed.add(g.id);
            result.push(g);
          }
        }
      }
    }
    return result;
  })();

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
            {' '}· {sortedArchival.length} archival
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

          return (
            <div key={image.id} className="flex items-start gap-2">
              {showSeparator && (
                <div className="self-stretch w-px bg-gray-700 mx-1" />
              )}
              <button
                onClick={() => onImageSelect(image)}
                className="relative block h-24 flex-shrink-0"
              >
                <div className={`relative h-full rounded ${
                  selectedImageId === image.id ? 'ring-2 ring-red-600' : ''
                } ${isArchival ? 'opacity-75 hover:opacity-100' : ''}`}>
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
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
