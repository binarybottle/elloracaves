'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getImageUrl, getThumbnailUrl } from '@/lib/cloudflare-images';
import { CAVE_POSITIONS, getDropdownLabel } from '@/components/cave/CaveMap';

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
  best_id: number | null;
}

interface CaveOption { cave_id: number; cave_name: string | null; }
interface PlanOption { plan_id: number; cave_id: number; plan_floor: number; }

export default function ImagesPage() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [caves, setCaves] = useState<CaveOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCaveId, setFilterCaveId] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [bestOnly, setBestOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageRow | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const caveNameMap = useMemo(() => new Map(caves.map(c => [c.cave_id, c.cave_name])), [caves]);

  const planInfoMap = useMemo(() => {
    const m = new Map<number, { cave_id: number; plan_floor: number }>();
    for (const p of plans) m.set(p.plan_id, { cave_id: p.cave_id, plan_floor: p.plan_floor });
    return m;
  }, [plans]);

  function caveDisplayName(caveId: number) {
    return getDropdownLabel(caveId);
  }

  function floorForImage(img: ImageRow): number {
    if (img.plan_id == null) return 1;
    const p = planInfoMap.get(img.plan_id);
    return p?.plan_floor ?? 1;
  }

  const allCaveIds = useMemo(() => {
    return Object.keys(CAVE_POSITIONS)
      .map(Number)
      .sort((a, b) => {
        const la = getDropdownLabel(a);
        const lb = getDropdownLabel(b);
        return la.localeCompare(lb, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, []);

  const floorsForCave = useMemo(() => {
    if (!filterCaveId) return [];
    const caveId = parseInt(filterCaveId, 10);
    const floors = new Set<number>();
    plans.filter(p => p.cave_id === caveId).forEach(p => floors.add(p.plan_floor));
    return Array.from(floors).sort((a, b) => a - b);
  }, [filterCaveId, plans]);

  useEffect(() => {
    async function fetchData() {
      const PAGE_SIZE = 1000;
      let allData: ImageRow[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('images')
          .select('image_id, cave_id, plan_id, rank, file_path, subject, description, cloudflare_image_id, cloudflare_thumbnail_id, thumbnail, plan_x_norm, plan_y_norm, best_id')
          .order('cave_id')
          .order('default_priority', { ascending: false })
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

    fetchData();
  }, []);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return images.filter((img) => {
      if (bestOnly && img.rank !== 1) return false;
      if (filterCaveId && String(img.cave_id) !== filterCaveId) return false;
      if (filterFloor) {
        const floor = floorForImage(img);
        if (String(floor) !== filterFloor) return false;
      }
      if (!img.cloudflare_image_id) return false;
      if (q) {
        const haystack = `${img.subject || ''} ${img.description || ''}`.toLowerCase();
        const words = q.split(/\s+/);
        if (!words.every(w => haystack.includes(w))) return false;
      }
      return true;
    });
  }, [images, bestOnly, filterCaveId, filterFloor, searchQuery, planInfoMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilter = !!(filterCaveId || filterFloor);

  const navigatePopup = useCallback((dir: -1 | 1) => {
    setSelectedImage(prev => {
      if (!prev) return prev;
      const idx = filteredImages.findIndex(i => i.image_id === prev.image_id);
      const next = filteredImages[idx + dir];
      return next ?? prev;
    });
  }, [filteredImages]);

  useEffect(() => {
    if (!selectedImage) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedImage(null);
      else if (e.key === 'ArrowRight') navigatePopup(1);
      else if (e.key === 'ArrowLeft') navigatePopup(-1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedImage, navigatePopup]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl text-white shrink-0">
              All Images
            </h1>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link href="/explore?cave=10" className="px-3 py-2 bg-white text-black rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors">
                Explore
              </Link>
              <Link href="/more" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
                More
              </Link>
              <Link href="/about" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, description…"
                className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg pl-9 pr-8 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 placeholder-gray-600"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline text-xs text-gray-600 bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <select
              value={filterCaveId}
              onChange={(e) => { setFilterCaveId(e.target.value); setFilterFloor(''); }}
              className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1.5 border border-gray-700"
            >
              <option value="">All Caves</option>
              {allCaveIds.map(id => (
                <option key={id} value={String(id)}>{caveDisplayName(id)}</option>
              ))}
            </select>
            {floorsForCave.length > 1 && (
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="bg-gray-800 text-gray-300 text-sm rounded px-2 py-1.5 border border-gray-700"
              >
                <option value="">All Floors</option>
                {floorsForCave.map(f => (
                  <option key={f} value={String(f)}>Floor {f}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setBestOnly(!bestOnly)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                bestOnly
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-transparent border-gray-700 text-gray-500'
              }`}
            >
              Best only
            </button>
            <span className="text-xs text-gray-500">
              {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilter && (
              <button
                onClick={() => { setFilterCaveId(''); setFilterFloor(''); setBestOnly(true); }}
                className="text-xs text-gray-400 hover:text-white transition-colors underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {filteredImages.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No images match the current filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredImages.map((img) => {
              const thumbUrl = getThumbnailUrl(img.cloudflare_image_id, img.cloudflare_thumbnail_id, img.file_path, img.thumbnail);
              const floor = floorForImage(img);

              return (
                <div key={img.image_id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  <div className="aspect-square relative bg-gray-950">
                    <button onClick={() => setSelectedImage(img)} className="w-full h-full text-left">
                      <img
                        src={thumbUrl}
                        alt={img.subject || img.file_path}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        loading="lazy"
                      />
                    </button>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {img.subject && (
                      <div className="text-xs text-[#eae2c4] truncate">{img.subject}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {caveDisplayName(img.cave_id)}
                      {floor > 1 && `, Floor ${floor}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedImage && (() => {
        const si = selectedImage;
        const popupFullUrl = getImageUrl(si.cloudflare_image_id, si.file_path, 'large');
        const idx = filteredImages.findIndex(i => i.image_id === si.image_id);
        const hasPrev = idx > 0;
        const hasNext = idx < filteredImages.length - 1;
        const floor = floorForImage(si);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-lg">&times;</button>

              {hasPrev && (
                <button onClick={() => navigatePopup(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&lsaquo;</button>
              )}
              {hasNext && (
                <button onClick={() => navigatePopup(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&rsaquo;</button>
              )}

              <div className="flex-1 min-h-0 flex items-center justify-center">
                <img
                  src={popupFullUrl}
                  alt={si.subject || si.file_path}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
              </div>

              <div className="bg-gray-900 rounded-b-lg px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {si.subject && <span className="text-[#eae2c4]">{si.subject}</span>}
                <span className="text-gray-500">{caveDisplayName(si.cave_id)}{floor > 1 && `, Floor ${floor}`}</span>
                {si.description && <span className="text-gray-400 text-xs">{si.description}</span>}
                <a href={popupFullUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline">Open full size</a>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
