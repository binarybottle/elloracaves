'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Image as ImageType } from '@/lib/api';
import { GroupInfo } from '@/lib/group-colors';
import { getImageUrl } from '@/lib/cloudflare-images';

interface GroupReviewOverlayProps {
  images: ImageType[];
  groupColorMap?: Map<number, GroupInfo>;
  onClose: () => void;
  onChangeBest: (newBestId: number) => void;
  onUpdateRank: (imageId: number, rank: number) => void;
}

export default function GroupReviewOverlay({
  images,
  groupColorMap,
  onClose,
  onChangeBest,
  onUpdateRank,
}: GroupReviewOverlayProps) {
  const [editingRankId, setEditingRankId] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-4xl mx-auto py-8 px-4 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between sticky top-0 z-10 bg-black/90 backdrop-blur py-3 px-1 -mx-1 rounded-lg">
          <span className="text-white text-lg">
            Reviewing {images.length} images
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {images.map(img => {
          const groupInfo = groupColorMap?.get(img.id);
          const isRoot = groupInfo && groupInfo.rootId === img.id;
          const isEditingRank = editingRankId === img.id;
          const largeUrl = img.image_url;

          return (
            <div
              key={img.id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
            >
              <img
                src={largeUrl}
                alt={img.subject || `#${img.id}`}
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-gray-500">#{img.id}</span>
                {img.subject && (
                  <span className="text-[#eae2c4]">{img.subject}</span>
                )}

                {/* Rank badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Rank</span>
                  {isEditingRank ? (
                    <form
                      className="inline-flex"
                      onSubmit={e => {
                        e.preventDefault();
                        const val = parseInt(rankInput, 10);
                        if (!isNaN(val)) onUpdateRank(img.id, val);
                        setEditingRankId(null);
                      }}
                    >
                      <input
                        type="number"
                        value={rankInput}
                        onChange={e => setRankInput(e.target.value)}
                        className="w-12 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                        autoFocus
                        onBlur={() => setEditingRankId(null)}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRankId(img.id);
                        setRankInput(String(img.rank));
                      }}
                      className="bg-white/90 text-black text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white transition-colors"
                    >
                      {img.rank}
                    </button>
                  )}
                </div>

                {/* Set as best */}
                <button
                  onClick={() => onChangeBest(img.id)}
                  className={`ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    isRoot
                      ? 'bg-yellow-600 text-white cursor-default'
                      : 'bg-gray-700 hover:bg-yellow-700 text-gray-300 hover:text-white'
                  }`}
                  disabled={!!isRoot}
                >
                  <Star className={`w-3 h-3 ${isRoot ? 'fill-white' : ''}`} />
                  {isRoot ? 'Best' : 'Set as best'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
