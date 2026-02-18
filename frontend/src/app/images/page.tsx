'use client';

import { useState, useEffect, useMemo } from 'react';
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
  hide_plan_xy: number;
}

interface CaveOption { cave_id: number; cave_name: string | null; }
interface PlanOption { plan_id: number; cave_id: number; plan_floor: number; }

type SortField = 'file_path' | 'rank' | 'image_id';

export default function ImagesReviewPage() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [caves, setCaves] = useState<CaveOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('file_path');

  const [filterImageId, setFilterImageId] = useState('');
  const [filterCaveId, setFilterCaveId] = useState('');
  const [filterPlanId, setFilterPlanId] = useState('');
  const [filterFilePath, setFilterFilePath] = useState('');
  const [filterRank, setFilterRank] = useState('');
  const [editingField, setEditingField] = useState<{ imageId: number; field: string } | null>(null);
  const [fieldInput, setFieldInput] = useState('');
  const [saving, setSaving] = useState<number | null>(null);

  const caveNameMap = useMemo(() => new Map(caves.map(c => [c.cave_id, c.cave_name])), [caves]);

  const planInfoMap = useMemo(() => {
    const m = new Map<number, { cave_id: number; plan_floor: number }>();
    for (const p of plans) m.set(p.plan_id, { cave_id: p.cave_id, plan_floor: p.plan_floor });
    for (const img of images) {
      if (img.plan_id != null && !m.has(img.plan_id))
        m.set(img.plan_id, { cave_id: img.cave_id, plan_floor: 1 });
    }
    return m;
  }, [plans, images]);

  function caveName(caveId: number) {
    if (caveId > 34) {
      const name = caveNameMap.get(caveId);
      if (name) return name;
    }
    return String(caveId);
  }

  function caveLabel(caveId: number) {
    if (caveId > 34) {
      const name = caveNameMap.get(caveId);
      if (name) {
        const display = name.startsWith('Cave ') ? name : `Cave ${name}`;
        return `${display} (${caveId})`;
      }
    }
    return `Cave ${caveId}`;
  }

  function planLabel(planId: number) {
    const p = planInfoMap.get(planId);
    if (!p) return String(planId);
    let label = caveName(p.cave_id);
    if (p.plan_floor > 1) label += `:${p.plan_floor}`;
    if (planId !== p.cave_id || p.cave_id > 34) label += ` (${planId})`;
    return label;
  }

  const allCaveIds = useMemo(() => {
    const ids = new Set<number>();
    caves.forEach(c => ids.add(c.cave_id));
    images.forEach(img => ids.add(img.cave_id));
    return Array.from(ids).sort((a, b) =>
      caveLabel(a).localeCompare(caveLabel(b), undefined, { numeric: true })
    );
  }, [caves, images, caveNameMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const allPlanIds = useMemo(() => {
    const ids = new Set<number>();
    plans.forEach(p => ids.add(p.plan_id));
    images.forEach(img => { if (img.plan_id != null) ids.add(img.plan_id); });
    return Array.from(ids).sort((a, b) => {
      const pa = planInfoMap.get(a);
      const pb = planInfoMap.get(b);
      const caveA = pa?.cave_id ?? a;
      const caveB = pb?.cave_id ?? b;
      if (caveA !== caveB) return caveA - caveB;
      const floorA = pa?.plan_floor ?? 1;
      const floorB = pb?.plan_floor ?? 1;
      return floorA - floorB;
    });
  }, [plans, images, planInfoMap]);

  async function toggleHidePlanXY(imageId: number, currentValue: number) {
    const newValue = currentValue ? 0 : 1;
    setSaving(imageId);
    const { error } = await supabase
      .from('images')
      .update({ hide_plan_xy: newValue })
      .eq('image_id', imageId);

    if (error) {
      alert(`Failed to update hide_plan_xy: ${error.message}`);
    } else {
      setImages(prev => prev.map(img =>
        img.image_id === imageId ? { ...img, hide_plan_xy: newValue } : img
      ));
    }
    setSaving(null);
  }

  async function updateField(imageId: number, field: 'rank' | 'cave_id' | 'plan_id', value: number) {
    setSaving(imageId);
    const { error } = await supabase
      .from('images')
      .update({ [field]: value })
      .eq('image_id', imageId);

    if (error) {
      alert(`Failed to update ${field}: ${error.message}`);
    } else {
      setImages(prev => prev.map(img =>
        img.image_id === imageId ? { ...img, [field]: value } : img
      ));
    }
    setSaving(null);
    setEditingField(null);
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
          .select('image_id, cave_id, plan_id, rank, file_path, subject, description, cloudflare_image_id, cloudflare_thumbnail_id, thumbnail, plan_x_norm, plan_y_norm, hide_plan_xy')
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

      const { data: cavesData } = await supabase
        .from('caves')
        .select('cave_id, cave_name')
        .order('cave_id');
      if (cavesData) setCaves(cavesData);

      const { data: plansData } = await supabase
        .from('plans')
        .select('plan_id, cave_id, plan_floor')
        .order('plan_id');
      if (plansData) setPlans(plansData);

      setLoading(false);
    }

    fetchImages();
  }, []);

  const filteredImages = images.filter((img) => {
    if (filterImageId.trim()) {
      const val = filterImageId.trim();
      if (val.includes('-')) {
        const [minStr, maxStr] = val.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (!isNaN(min) && !isNaN(max) && (img.image_id < min || img.image_id > max)) return false;
      } else if (val.includes(',')) {
        const ids = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        if (!ids.includes(img.image_id)) return false;
      } else {
        if (String(img.image_id) !== val) return false;
      }
    }
    if (filterCaveId.trim() && String(img.cave_id) !== filterCaveId.trim()) return false;
    if (filterPlanId.trim() && String(img.plan_id) !== filterPlanId.trim()) return false;
    if (filterFilePath.trim() && !img.file_path.toLowerCase().includes(filterFilePath.trim().toLowerCase())) return false;
    if (filterRank.trim()) {
      const val = filterRank.trim();
      if (val.includes('-')) {
        const [minStr, maxStr] = val.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (!isNaN(min) && !isNaN(max) && (img.rank < min || img.rank > max)) return false;
      } else if (val.includes(',')) {
        const ranks = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        if (!ranks.includes(img.rank)) return false;
      } else {
        if (String(img.rank) !== val) return false;
      }
    }
    return true;
  });

  const hasActiveFilter = !!(filterImageId.trim() || filterCaveId.trim() || filterPlanId.trim() || filterFilePath.trim() || filterRank.trim());

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
              placeholder="Rank (2, 0-5, 0,2)"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-40"
            />
            <input
              type="text"
              value={filterImageId}
              onChange={(e) => setFilterImageId(e.target.value)}
              placeholder="ID (5, 1-50, 3,7,9)"
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700 w-40"
            />
            <select
              value={filterCaveId}
              onChange={(e) => setFilterCaveId(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700"
            >
              <option value="">Cave…</option>
              {allCaveIds.map(id => (
                <option key={id} value={String(id)}>{caveLabel(id)}</option>
              ))}
            </select>
            <select
              value={filterPlanId}
              onChange={(e) => setFilterPlanId(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1 border border-gray-700"
            >
              <option value="">Plan…</option>
              {allPlanIds.map(id => (
                <option key={id} value={String(id)}>{planLabel(id)}</option>
              ))}
            </select>
            {hasActiveFilter && (
              <>
                <span className="text-xs text-gray-500">
                  {filteredImages.length} of {images.length}
                </span>
                <button
                  onClick={() => { setFilterImageId(''); setFilterCaveId(''); setFilterPlanId(''); setFilterFilePath(''); setFilterRank(''); }}
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
              const isEditingRank = editingField?.imageId === img.image_id && editingField?.field === 'rank';
              const isEditingCave = editingField?.imageId === img.image_id && editingField?.field === 'cave_id';
              const isEditingPlan = editingField?.imageId === img.image_id && editingField?.field === 'plan_id';

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
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHidePlanXY(img.image_id, img.hide_plan_xy); }}
                            className={`absolute top-1 left-1 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                              img.hide_plan_xy ? 'bg-gray-500' : 'bg-[#6ebd20]'
                            }`}
                            title={img.hide_plan_xy ? 'Landmark hidden — click to show on plan' : 'Landmark shown — click to hide from plan'}
                          />
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
                      {isEditingRank ? (
                        <form
                          className="flex items-center gap-1 ml-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = parseInt(fieldInput, 10);
                            if (!isNaN(val)) updateField(img.image_id, 'rank', val);
                          }}
                        >
                          <input
                            type="number"
                            value={fieldInput}
                            onChange={(e) => setFieldInput(e.target.value)}
                            className="w-10 bg-gray-800 text-white text-xs text-center rounded border border-gray-600 px-1 py-0.5"
                            autoFocus
                            onBlur={() => setEditingField(null)}
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => { setEditingField({ imageId: img.image_id, field: 'rank' }); setFieldInput(String(img.rank)); }}
                          className={`ml-1 flex-shrink-0 bg-white/90 text-black text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white transition-colors ${saving === img.image_id ? 'opacity-50' : ''}`}
                          title="Click to edit rank"
                        >
                          {saving === img.image_id ? '...' : img.rank}
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-0.5 flex-wrap">
                      <span className="shrink-0">Cave</span>
                      {isEditingCave ? (
                        <select
                          value={String(img.cave_id)}
                          onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) updateField(img.image_id, 'cave_id', val); }}
                          className="bg-gray-800 text-white text-xs rounded border border-gray-600 px-0.5 py-0"
                          autoFocus
                          onBlur={() => setEditingField(null)}
                        >
                          {allCaveIds.map(id => (
                            <option key={id} value={String(id)}>{caveLabel(id)}</option>
                          ))}
                        </select>
                      ) : (
                        <button onClick={() => setEditingField({ imageId: img.image_id, field: 'cave_id' })} className="text-gray-300 hover:text-white underline decoration-dotted" title="Click to edit cave_id">{img.cave_id}</button>
                      )}
                      <span>| ID {img.image_id} | Plan</span>
                      {isEditingPlan ? (
                        <select
                          value={String(img.plan_id ?? '')}
                          onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) updateField(img.image_id, 'plan_id', val); }}
                          className="bg-gray-800 text-white text-xs rounded border border-gray-600 px-0.5 py-0"
                          autoFocus
                          onBlur={() => setEditingField(null)}
                        >
                          <option value="">—</option>
                          {allPlanIds.map(id => (
                            <option key={id} value={String(id)}>{planLabel(id)}</option>
                          ))}
                        </select>
                      ) : (
                        <button onClick={() => setEditingField({ imageId: img.image_id, field: 'plan_id' })} className="text-gray-300 hover:text-white underline decoration-dotted" title="Click to edit plan_id">
                          {img.plan_id != null ? planLabel(img.plan_id) : '—'}
                        </button>
                      )}
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
