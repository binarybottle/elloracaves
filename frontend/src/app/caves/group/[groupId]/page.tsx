'use client';

export const runtime = 'edge';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CaveMap from '@/components/cave/CaveMap';
import ImageDisplay from '@/components/cave/ImageDisplay';
import ImageInfoPanel from '@/components/cave/ImageInfoPanel';
import ImageGalleryStrip from '@/components/cave/ImageGalleryStrip';
import { CAVE_GROUP_BY_SLUG, CaveGroup } from '@/lib/caveGroups';
import { fetchCaveImages, fetchImageSiblingGroup, Image } from '@/lib/api';

function CaveGroupContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const groupId = params.groupId as string;
  const group: CaveGroup | undefined = CAVE_GROUP_BY_SLUG[groupId];
  const editMode = searchParams.has('edit');
  const imageIdParam = searchParams.get('image');

  const [images, setImages] = useState<Image[]>([]);
  const [imagesByCave, setImagesByCave] = useState<Record<number, Image[]>>({});
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [hoveredImage, setHoveredImage] = useState<Image | null>(null);
  const [similarImages, setSimilarImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  const displayedImage = hoveredImage || selectedImage;

  useEffect(() => {
    if (!group) return;
    const resolvedGroup = group;
    async function loadImages() {
      const results = await Promise.all(
        resolvedGroup.caveIds.map(async (id) => {
          const imgs = await fetchCaveImages(String(id), 500);
          return [id, imgs] as [number, Image[]];
        })
      );
      const byId = Object.fromEntries(results);
      const pooled = results.flatMap(([, imgs]) => imgs);
      setImagesByCave(byId);
      setImages(pooled);
      if (!imageIdParam && pooled.length > 0) {
        setSelectedImage(pooled[0]);
      }
      setLoading(false);
    }
    loadImages();
  }, [group]);

  // Select image from URL param once images are loaded
  useEffect(() => {
    if (!imageIdParam || images.length === 0) return;
    const found = images.find(img => img.id === parseInt(imageIdParam, 10));
    if (found) setSelectedImage(found);
  }, [imageIdParam, images]);

  // Fetch similar images for the displayed image
  useEffect(() => {
    if (!displayedImage) { setSimilarImages([]); return; }
    let cancelled = false;
    fetchImageSiblingGroup(displayedImage.id, displayedImage.best_id).then(imgs => {
      if (!cancelled) setSimilarImages(imgs);
    });
    return () => { cancelled = true; };
  }, [displayedImage?.id, displayedImage?.best_id]);

  const currentIndex = selectedImage ? images.findIndex(img => img.id === selectedImage.id) : -1;

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) setSelectedImage(images[currentIndex - 1]);
  }, [currentIndex, images]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) setSelectedImage(images[currentIndex + 1]);
  }, [currentIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const handleImageSelect = useCallback((image: Image) => {
    setSelectedImage(image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!group) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Group not found
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading…</div>
      </div>
    );
  }

  // Fake cave object for ImageDisplay / ImageInfoPanel
  const fakeCave = { id: group.virtualId, cave_number: String(group.virtualId), name: group.label, tradition: group.tradition };

  // Edit mode: sectioned grid with Edit → links per sub-group
  if (editMode) {
    return (
      <div className="min-h-screen bg-black text-[#eae2c4]">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/explore?cave=10" className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm hover:bg-white/20 transition-colors">
              ← Explore
            </Link>
            <h1 className="text-2xl">{group.label} — Edit mode</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10 max-w-6xl">
          {group.caveIds.map((caveId) => {
            const imgs = imagesByCave[caveId] ?? [];
            if (imgs.length === 0) return null;
            return (
              <section key={caveId} className="mb-12">
                <h2 className="text-lg text-gray-300 mb-4 border-b border-gray-800 pb-2 flex items-center gap-4">
                  <span>{group.subLabels[caveId]}</span>
                  <Link
                    href={`/explore?cave=${caveId}&edit`}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Edit →
                  </Link>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {imgs.map((image) => (
                    <Link
                      key={image.id}
                      href={`/explore?cave=${image.cave_id}&image=${image.id}&edit`}
                      className="group rounded-lg overflow-hidden border border-gray-700 hover:border-gray-400 transition-all"
                    >
                      <div className="aspect-square bg-gray-900 relative">
                        {image.thumbnail_url ? (
                          <img src={image.thumbnail_url} alt={image.subject || ''} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">No image</div>
                        )}
                      </div>
                      {image.subject && (
                        <div className="p-2 text-xs text-gray-400 truncate">{image.subject}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    );
  }

  // Explore mode: same layout as individual cave pages (no floor plan)
  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      {/* Header: Cave map — desktop only */}
      <header className="relative w-full overflow-hidden hidden md:block">
        <div className="absolute left-5 top-4 z-20 flex items-center gap-4">
          <h1 className="text-3xl">The Ellora caves</h1>
          <Link href="/about" className="px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all text-sm font-semibold">
            About
          </Link>
          <Link href="/more" className="px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all text-sm font-semibold">
            More
          </Link>
        </div>
        <div className="w-full overflow-hidden">
          <CaveMap selectedCaveId={group.virtualId} className="w-full" />
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">The Ellora caves</h1>
          <div className="flex gap-2">
            <Link href="/more" className="px-3 py-2 bg-black/90 border border-gray-600 rounded-lg text-white text-sm">More</Link>
            <Link href="/about" className="px-3 py-2 bg-black/90 border border-gray-600 rounded-lg text-white text-sm">About</Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        {/* Desktop: image + info panel side by side */}
        <div className="hidden lg:grid lg:grid-cols-[360px_320px] gap-6 max-w-3xl mx-auto items-start">
          <ImageDisplay
            image={displayedImage}
            cave={fakeCave}
            floorNumber={1}
            onPrev={currentIndex > 0 ? goToPrev : undefined}
            onNext={currentIndex < images.length - 1 ? goToNext : undefined}
            currentIndex={currentIndex}
            totalImages={images.length}
          />
          <ImageInfoPanel
            image={displayedImage}
            cave={fakeCave}
            similarImages={similarImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
          />
        </div>

        {/* Tablet */}
        <div className="hidden md:block lg:hidden max-w-xl mx-auto space-y-6">
          <ImageDisplay
            image={displayedImage}
            cave={fakeCave}
            floorNumber={1}
            onPrev={currentIndex > 0 ? goToPrev : undefined}
            onNext={currentIndex < images.length - 1 ? goToNext : undefined}
            currentIndex={currentIndex}
            totalImages={images.length}
          />
          <ImageInfoPanel
            image={displayedImage}
            cave={fakeCave}
            similarImages={similarImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
          />
        </div>

        {/* Mobile */}
        <div className="block md:hidden max-w-2xl mx-auto space-y-4">
          <ImageDisplay
            image={displayedImage}
            cave={fakeCave}
            floorNumber={1}
            onPrev={currentIndex > 0 ? goToPrev : undefined}
            onNext={currentIndex < images.length - 1 ? goToNext : undefined}
            currentIndex={currentIndex}
            totalImages={images.length}
          />
          <ImageInfoPanel
            image={displayedImage}
            cave={fakeCave}
            collapsible
            similarImages={similarImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
          />
        </div>

        {/* Thumbnail strip */}
        <div className="mt-12 max-w-7xl mx-auto">
          <ImageGalleryStrip
            images={images}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            cave={fakeCave}
            floorNumber={1}
          />
        </div>
      </main>
    </div>
  );
}

export default function CaveGroupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading…</div>
      </div>
    }>
      <CaveGroupContent />
    </Suspense>
  );
}
