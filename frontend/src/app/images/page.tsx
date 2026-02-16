'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getImageUrl, getThumbnailUrl } from '@/lib/cloudflare-images';

interface ImageRow {
  image_id: number;
  cave_id: number;
  plan_id: number | null;
  rank: number;
  file_path: string;
  subject: string;
  description: string;
  cloudflare_image_id: string | null;
  cloudflare_thumbnail_id: string | null;
  thumbnail: string | null;
  plan_x_norm: number | null;
  plan_y_norm: number | null;
}

type SortField = 'file_path' | 'rank' | 'image_id';

export default function ImagesReviewPage() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('file_path');

  const [filterImageId, setFilterImageId] = useState('');
  const [filterPlanId, setFilterPlanId] = useState('');
  const [filterFilePath, setFilterFilePath] = useState('');
  const [filterRank, setFilterRank] = useState('');
  const [editingRank, setEditingRank] = useState<number | null>(null);
  const [rankInput, setRankInput] = useState('');
  const [saving, setSaving] = useState<number | null>(null);

  async function updateRank(imageId: number, newRank: number) {
    setSaving(imageId);
    const { error } = await supabase
      .from('images')
      .update({ rank: newRank })
      .eq('image_id', imageId);

    if (error) {
      alert(`Failed to update rank: ${error.message}`);
    } else {
      setImages(prev => prev.map(img =>
        img.image_id === imageId ? { ...img, rank: newRank } : img
      ));
    }
    setSaving(null);
    setEditingRank(null);
  }

  useEffect(() => {
    async function fetchImages() {
      const PAGE_SIZE = 1000;
      let allData: ImageRow[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('images')
          .select('image_id, cave_id, plan_id, rank, file_path, subject, description, cloudflare_image_id, cloudflare_thumbnail_id, thumbnail, plan_x_norm, plan_y_norm')
          .order('cave_id')
          .order('file_path')
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        allData = allData.concat(data || []);
        hasMore = (data?.length || 0) === PAGE_SIZE;
        from += PAGE_SIZE;
      }

      setImages(allData);
      setLoading(false);
    }

    fetchImages();
  }, []);

  const filteredImages = images.filter((img) => {
    if (filterImageId.trim() && String(img.image_id) !== filterImageId.trim()) return false;
    if (filterPlanId.trim() && String(img.plan_id) !== filterPlanId.trim()) return false;
    if (filterFilePath.trim() && !img.file_path.toLowerCase().includes(filterFilePath.trim().toLowerCase())) return false;
    if (filterRank.trim() && String(img.rank) !== filterRank.trim()) return false;
    return true;
  });

  const hasActiveFilter = !!(filterImageId.trim() || filterPlanId.trim() || filterFilePath.trim() || filterRank.trim());

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'rank') {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.cave_id !== b.cave_id) return a.cave_id - b.cave_id;
      return a.file_path.localeCompare(b.file_path);
    }
    if (sortBy === 'image_id') {
      return a.image_id - b.image_id;
    }
    return a.file_path.localeCompare(b.file_path);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading images...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl text-white">
            Images — {images.length} total
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Sort by:</span>
              {(['file_path', 'rank', 'image_id'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => setSortBy(field)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    sortBy === field
                      ? 'bg-white text-black font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {field === 'file_path' ? 'File Path' : field === 'rank' ? 'Rank' : 'ID'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-sm text-gray-400">Filter:</span>
            <input
              type="text"
              value={filterFilePath}
              onChange={(e) => setFilterFilePath(e.target.value)}
              placeholder="File path (e.g. c16/)"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-44"
            />
            <input
              type="text"
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              placeholder="Rank (e.g. 0, 2)"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-32"
            />
            <input
              type="text"
              value={filterImageId}
              onChange={(e) => setFilterImageId(e.target.value)}
              placeholder="Image ID"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-28"
            />
            <input
              type="text"
              value={filterPlanId}
              onChange={(e) => setFilterPlanId(e.target.value)}
              placeholder="Plan ID"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-28"
            />
            {hasActiveFilter && (
              <>
                <span className="text-xs text-gray-500">
                  {filteredImages.length} of {images.length}
                </span>
                <button
                  onClick={() => { setFilterImageId(''); setFilterPlanId(''); setFilterFilePath(''); setFilterRank(''); }}
                  className="text-xs text-gray-400 hover:text-white transition-colors underline"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {sortedImages.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            {hasActiveFilter ? 'No images match the current filters.' : 'No images found.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedImages.map((img) => {
              const hasCloudflare = !!img.cloudflare_image_id;
              const thumbUrl = hasCloudflare
                ? getThumbnailUrl(img.cloudflare_image_id, img.cloudflare_thumbnail_id, img.file_path, img.thumbnail)
                : '';
              const fullUrl = hasCloudflare
                ? getImageUrl(img.cloudflare_image_id, img.file_path, 'large')
                : '';

              const hasCoords = img.plan_x_norm !== null && img.plan_y_norm !== null;
              const isEditing = editingRank === img.image_id;

              return (
                <div key={img.image_id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  {hasCloudflare ? (
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-square relative bg-gray-950">
                        <img
                          src={thumbUrl}
                          alt={img.subject || img.file_path}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        />
                        {hasCoords && (
                          <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#6ebd20] rounded-full border border-white shadow-sm" />
                        )}
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-square relative bg-gray-950 flex items-center justify-center">
                      <span className="text-xs text-gray-600 text-center px-2">No image on Cloudflare</span>
                    </div>
                  )}
                  <div className="p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono text-gray-400 break-all flex-1">{img.file_path}</div>
                      {isEditing ? (
                        <form
                          className="flex items-center gap-1 ml-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = parseInt(rankInput, 10);
                            if (!isNaN(val) && val >= 0) updateRank(img.image_id, val);
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            value={rankInput}
                            onChange={(e) => setRankInput(e.target.value)}
                            className="w-10 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                            autoFocus
                            onBlur={() => setEditingRank(null)}
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => { setEditingRank(img.image_id); setRankInput(String(img.rank)); }}
                          className={`ml-1 flex-shrink-0 bg-white/90 text-black text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white transition-colors ${saving === img.image_id ? 'opacity-50' : ''}`}
                          title="Click to edit rank"
                        >
                          {saving === img.image_id ? '...' : img.rank}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cave {img.cave_id} | ID {img.image_id}{img.plan_id ? ` | Plan ${img.plan_id}` : ''}
                    </div>
                    {img.subject && (
                      <div className="text-xs text-[#eae2c4] truncate">{img.subject}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
