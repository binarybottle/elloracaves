'use client';

import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getImageUrl, getThumbnailUrl } from '@/lib/cloudflare-images';
import { getDropdownLabel } from '@/components/cave/CaveMap';

interface ImageRow {
  image_id: number;
  cave_id: number;
  plan_id: number | null;
  rank: number;
  file_path: string;
  subject: string;
  description: string;
  cloudflare_image_id: string | null;
  archival: boolean | null;
  book_page: number | null;
  book_figure: string | null;
  medium: string | null;
}

interface PlanOption {
  plan_id: number;
  cave_id: number;
  plan_floor: number;
}

interface CuratedImageCollectionPageProps {
  title: string;
  intro?: ReactNode;
  emptyMessage: string;
  includeImage: (image: ImageRow) => boolean;
  sortImages?: (a: ImageRow, b: ImageRow) => number;
  renderMeta?: (image: ImageRow, floorNumber: number | null) => ReactNode;
  showSearch?: boolean;
}

function getBookFigureSortValue(bookFigure: string | null): number {
  if (!bookFigure) return Number.MAX_SAFE_INTEGER;
  const match = bookFigure.match(/\d+/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return parseInt(match[0], 10);
}

export default function CuratedImageCollectionPage({
  title,
  intro,
  emptyMessage,
  includeImage,
  sortImages,
  renderMeta,
  showSearch = true,
}: CuratedImageCollectionPageProps) {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageRow | null>(null);

  const planInfoMap = useMemo(() => {
    const map = new Map<number, { cave_id: number; plan_floor: number }>();
    for (const plan of plans) {
      map.set(plan.plan_id, { cave_id: plan.cave_id, plan_floor: plan.plan_floor });
    }
    return map;
  }, [plans]);

  const floorForImage = useCallback((img: ImageRow): number | null => {
    if (img.plan_id == null) return null;
    const plan = planInfoMap.get(img.plan_id);
    return plan?.plan_floor ?? null;
  }, [planInfoMap]);

  useEffect(() => {
    async function fetchData() {
      const PAGE_SIZE = 1000;
      let allData: ImageRow[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error: pageError } = await supabase
          .from('images')
          .select('image_id, cave_id, plan_id, rank, file_path, subject, description, cloudflare_image_id, archival, book_page, book_figure, medium')
          .order('cave_id')
          .order('default_priority', { ascending: false })
          .order('file_path')
          .range(from, from + PAGE_SIZE - 1);

        if (pageError) {
          setError(pageError.message);
          setLoading(false);
          return;
        }

        allData = allData.concat(data || []);
        hasMore = (data?.length || 0) === PAGE_SIZE;
        from += PAGE_SIZE;
      }

      setImages(allData.filter((img) => !!img.cloudflare_image_id));

      const { data: plansData } = await supabase
        .from('plans')
        .select('plan_id, cave_id, plan_floor')
        .order('plan_id');

      if (plansData) setPlans(plansData);
      setLoading(false);
    }

    fetchData();
  }, []);

  const collectionImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = images.filter((img) => {
      if (!includeImage(img)) return false;
      if (!query) return true;
      const haystack = `${img.subject || ''} ${img.description || ''} ${img.book_figure || ''} ${img.file_path || ''}`.toLowerCase();
      const words = query.split(/\s+/);
      return words.every((word) => haystack.includes(word));
    });

    if (sortImages) return [...filtered].sort(sortImages);

    return [...filtered].sort((a, b) => {
      if (a.cave_id !== b.cave_id) return a.cave_id - b.cave_id;
      if ((a.book_page ?? Number.MAX_SAFE_INTEGER) !== (b.book_page ?? Number.MAX_SAFE_INTEGER)) {
        return (a.book_page ?? Number.MAX_SAFE_INTEGER) - (b.book_page ?? Number.MAX_SAFE_INTEGER);
      }
      if ((a.book_figure || '') !== (b.book_figure || '')) {
        const figureCompare = getBookFigureSortValue(a.book_figure) - getBookFigureSortValue(b.book_figure);
        if (figureCompare !== 0) return figureCompare;
        return (a.book_figure || '').localeCompare((b.book_figure || ''), undefined, { numeric: true, sensitivity: 'base' });
      }
      return a.file_path.localeCompare(b.file_path);
    });
  }, [images, includeImage, searchQuery, sortImages]);

  const navigatePopup = useCallback((direction: -1 | 1) => {
    setSelectedImage((prev) => {
      if (!prev) return prev;
      const index = collectionImages.findIndex((image) => image.image_id === prev.image_id);
      const next = collectionImages[index + direction];
      return next ?? prev;
    });
  }, [collectionImages]);

  useEffect(() => {
    if (!selectedImage) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedImage(null);
      else if (event.key === 'ArrowRight') navigatePopup(1);
      else if (event.key === 'ArrowLeft') navigatePopup(-1);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedImage, navigatePopup]);

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
            <h1 className="text-3xl text-white">{title}</h1>
            <div className="flex flex-wrap gap-2">
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
          <div className="mt-4">
            {showSearch && (
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search subject, description, figure, or file path..."
                className="w-full md:w-[440px] bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-gray-500 placeholder-gray-600"
              />
            )}
            <p className={`text-xs text-gray-500 ${showSearch ? 'mt-2' : ''}`}>
              {collectionImages.length} image{collectionImages.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {intro && (
          <section className="mb-10 prose prose-invert max-w-none text-base leading-relaxed">
            {intro}
          </section>
        )}

        {collectionImages.length === 0 ? (
          <p className="text-gray-400 text-center py-12">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {collectionImages.map((img) => {
              const thumbUrl = getThumbnailUrl(img.cloudflare_image_id, img.file_path);
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
                    {renderMeta ? (
                      <div className="text-xs text-gray-400 truncate">
                        {renderMeta(img, floor)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {getDropdownLabel(img.cave_id)}
                        {floor && floor > 1 ? `, Floor ${floor}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedImage && (() => {
        const fullUrl = getImageUrl(selectedImage.cloudflare_image_id, selectedImage.file_path, 'large');
        const index = collectionImages.findIndex((image) => image.image_id === selectedImage.image_id);
        const hasPrev = index > 0;
        const hasNext = index < collectionImages.length - 1;
        const floor = floorForImage(selectedImage);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-lg">&times;</button>

              {hasPrev && (
                <button onClick={() => navigatePopup(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&lsaquo;</button>
              )}
              {hasNext && (
                <button onClick={() => navigatePopup(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 flex items-center justify-center text-xl">&rsaquo;</button>
              )}

              <div className="flex-1 min-h-0 flex items-center justify-center">
                <img
                  src={fullUrl}
                  alt={selectedImage.subject || selectedImage.file_path}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
              </div>

              <div className="bg-gray-900 rounded-b-lg px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {selectedImage.subject && <span className="text-[#eae2c4]">{selectedImage.subject}</span>}
                <span className="text-gray-500">
                  {getDropdownLabel(selectedImage.cave_id)}
                  {floor && floor > 1 ? `, Floor ${floor}` : ''}
                </span>
                {selectedImage.description && <span className="text-gray-400 text-xs">{selectedImage.description}</span>}
                {renderMeta && (
                  <span className="text-gray-300 text-xs">{renderMeta(selectedImage, floor)}</span>
                )}
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline">Open full size</a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
