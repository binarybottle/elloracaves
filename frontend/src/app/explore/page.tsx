// app/explore/page.tsx
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import CaveMap from '@/components/cave/CaveMap';
import FloorPlanSidebar from '@/components/cave/FloorPlanSidebar';
import InteractiveFloorPlan from '@/components/cave/InteractiveFloorPlan';
import ImageDisplay from '@/components/cave/ImageDisplay';
import ImageInfoPanel from '@/components/cave/ImageInfoPanel';
import ImageGalleryStrip from '@/components/cave/ImageGalleryStrip';
import SearchOverlay from '@/components/search/SearchOverlay';
import { fetchCaveDetail, fetchCaveFloorImages, fetchImageDetail, Cave, Image } from '@/lib/api';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const caveId = searchParams.get('cave') || '10';
  const floorNumberParam = searchParams.get('floor');
  const imageId = searchParams.get('image');
  
  const [cave, setCave] = useState<Cave | null>(null);
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [floorImages, setFloorImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [hoveredImage, setHoveredImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // The image to display - hovered takes precedence over selected
  const displayedImage = hoveredImage || selectedImage;

  // Get current image index (based on selected, not hovered)
  const currentIndex = selectedImage 
    ? floorImages.findIndex(img => img.id === selectedImage.id)
    : -1;

  // Navigate to previous/next image
  const goToPrevImage = useCallback(() => {
    if (currentIndex > 0) {
      const prevImage = floorImages[currentIndex - 1];
      setSelectedImage(prevImage);
      router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${prevImage.id}`, { scroll: false });
    }
  }, [currentIndex, floorImages, caveId, floorNumber, router]);

  const goToNextImage = useCallback(() => {
    if (currentIndex < floorImages.length - 1) {
      const nextImage = floorImages[currentIndex + 1];
      setSelectedImage(nextImage);
      router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${nextImage.id}`, { scroll: false });
    }
  }, [currentIndex, floorImages, caveId, floorNumber, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }
      
      // Don't handle arrow keys if search is open
      if (showSearch) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevImage, goToNextImage, showSearch]);

  // Fetch cave data and determine default floor
  useEffect(() => {
    async function loadCave() {
      try {
        const data = await fetchCaveDetail(caveId);
        setCave(data);
        
        // Determine the floor to show
        if (floorNumberParam) {
          // Use floor from URL if specified
          setFloorNumber(parseInt(floorNumberParam));
        } else if (data.plans && data.plans.length > 0) {
          // Default to the lowest floor number
          const lowestFloor = Math.min(...data.plans.map(p => p.floor_number));
          setFloorNumber(lowestFloor);
          // Update URL to include the default floor
          router.replace(`/explore?cave=${caveId}&floor=${lowestFloor}`, { scroll: false });
        }
      } catch (error) {
        console.error('Error fetching cave:', error);
      }
    }
    loadCave();
  }, [caveId, floorNumberParam, router]);

  // Fetch floor images
  useEffect(() => {
    async function loadFloorImages() {
      if (!cave) return;
      try {
        const data = await fetchCaveFloorImages(caveId, floorNumber);
        setFloorImages(data);
        
        // Select first image if none selected (or default/priority image)
        if (!imageId && data.length > 0) {
          const defaultImage = data[0];
          setSelectedImage(defaultImage);
        }
      } catch (error) {
        console.error('Error fetching floor images:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFloorImages();
  }, [cave, caveId, floorNumber, imageId]);

  // Fetch specific image if imageId is in URL
  useEffect(() => {
    async function loadImage() {
      if (!imageId) return;
      try {
        const data = await fetchImageDetail(parseInt(imageId, 10));
        setSelectedImage(data);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }
    loadImage();
  }, [imageId]);

  const handleCaveSelect = (newCaveId: number) => {
    router.push(`/explore?cave=${newCaveId}`);
  };

  const handleFloorSelect = (newFloor: number) => {
    router.push(`/explore?cave=${caveId}&floor=${newFloor}`);
  };

  const handleImageSelect = (image: Image) => {
    setSelectedImage(image);
    router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${image.id}`);
    // Scroll to top when selecting from gallery
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageHover = (image: Image | null) => {
    setHoveredImage(image);
  };

  const handleSearchSelect = (searchCaveId: number, searchFloorNumber: number, searchImageId: number) => {
    router.push(`/explore?cave=${searchCaveId}&floor=${searchFloorNumber}&image=${searchImageId}`);
  };

  const currentPlan = cave?.plans?.find((p) => p.floor_number === floorNumber);
  const hasMultipleFloors = (cave?.plans?.length || 0) > 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      {/* Header Section with Cave Map - Hidden on mobile */}
      <header className="relative w-full overflow-hidden hidden md:block">
        {/* Title, About, and Search Button */}
        <div className="absolute left-5 top-4 z-20 flex items-center gap-4">
          <h1 className="text-3xl">The Ellora caves</h1>
          <Link
            href="/about"
            className="px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all text-sm font-semibold"
          >
            About
          </Link>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all"
            title="Search images (Cmd/Ctrl + K)"
          >
            <Search className="h-5 w-5" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline px-2 py-0.5 text-xs bg-gray-800 rounded border border-gray-600">⌘K</kbd>
          </button>
        </div>

        {/* Cave Map with clickable numbers */}
        <div className="w-full overflow-hidden">
          <CaveMap 
            selectedCaveId={parseInt(caveId)} 
            className="w-full"
          />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl">The Ellora caves</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 bg-black/90 border border-gray-600 rounded-lg text-white"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/about"
              className="px-3 py-2 bg-black/90 border border-gray-600 rounded-lg text-white text-sm"
            >
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-8">
        {/* Desktop Layout - changes based on number of floors and plan availability */}
        {currentPlan ? (
          hasMultipleFloors ? (
            /* Multi-floor layout: 4-column grid with sidebar */
            <div className="hidden lg:grid lg:grid-cols-[120px_1fr_360px_320px] gap-6 max-w-7xl mx-auto">
              {/* Column 1: Mini Floor Plans */}
              <FloorPlanSidebar
                floors={cave?.plans || []}
                selectedFloor={floorNumber}
                onSelectFloor={handleFloorSelect}
                caveId={caveId}
              />

              {/* Column 2: Interactive Floor Plan */}
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                onImageHover={handleImageHover}
              />

              {/* Column 3: Main Image Display */}
              <ImageDisplay
                image={displayedImage}
                cave={cave}
                floorNumber={floorNumber}
                onPrev={currentIndex > 0 ? goToPrevImage : undefined}
                onNext={currentIndex < floorImages.length - 1 ? goToNextImage : undefined}
                currentIndex={currentIndex}
                totalImages={floorImages.length}
              />

              {/* Column 4: Image Info Panel */}
              <ImageInfoPanel
                image={displayedImage}
                cave={cave}
              />
            </div>
          ) : (
            /* Single-floor layout: 3-column grid without sidebar */
            <div className="hidden lg:grid lg:grid-cols-[1fr_360px_320px] gap-6 max-w-7xl mx-auto">
              {/* Column 1: Interactive Floor Plan (full size) */}
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                onImageHover={handleImageHover}
              />

              {/* Column 2: Main Image Display */}
              <ImageDisplay
                image={displayedImage}
                cave={cave}
                floorNumber={floorNumber}
                onPrev={currentIndex > 0 ? goToPrevImage : undefined}
                onNext={currentIndex < floorImages.length - 1 ? goToNextImage : undefined}
                currentIndex={currentIndex}
                totalImages={floorImages.length}
              />

              {/* Column 3: Image Info Panel */}
              <ImageInfoPanel
                image={displayedImage}
                cave={cave}
              />
            </div>
          )
        ) : (
          /* No plan available: 2-column layout with image and info only */
          <div className="hidden lg:grid lg:grid-cols-[360px_320px] gap-6 max-w-3xl mx-auto">
            {/* Column 1: Main Image Display */}
            <ImageDisplay
              image={displayedImage}
              cave={cave}
              floorNumber={floorNumber}
              onPrev={currentIndex > 0 ? goToPrevImage : undefined}
              onNext={currentIndex < floorImages.length - 1 ? goToNextImage : undefined}
              currentIndex={currentIndex}
              totalImages={floorImages.length}
            />

            {/* Column 2: Image Info Panel */}
            <ImageInfoPanel
              image={displayedImage}
              cave={cave}
            />
          </div>
        )}

        {/* Tablet Layout: 2 columns, stacked */}
        <div className="hidden md:block lg:hidden max-w-4xl mx-auto space-y-6">
          {/* Floor selector tabs (only if multiple floors) */}
          {hasMultipleFloors && (
            <div className="flex gap-2 justify-center">
              {cave?.plans?.map((plan) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 rounded ${
                    plan.floor_number === floorNumber
                      ? 'bg-[#487a14] text-white'
                      : 'bg-gray-800 text-[#eae2c4]'
                  }`}
                >
                  Floor {plan.floor_number}
                </button>
              ))}
            </div>
          )}

          <div className={currentPlan ? "grid grid-cols-2 gap-4" : "max-w-md mx-auto"}>
            {currentPlan && (
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                onImageHover={handleImageHover}
              />
            )}
            <ImageDisplay
              image={displayedImage}
              cave={cave}
              floorNumber={floorNumber}
              onPrev={currentIndex > 0 ? goToPrevImage : undefined}
              onNext={currentIndex < floorImages.length - 1 ? goToNextImage : undefined}
              currentIndex={currentIndex}
              totalImages={floorImages.length}
            />
          </div>

          <ImageInfoPanel
            image={displayedImage}
            cave={cave}
          />
        </div>

        {/* Mobile Layout: Vertical stack */}
        <div className="block md:hidden max-w-2xl mx-auto space-y-4">
          {/* Cave selector */}
          <select
            value={caveId}
            onChange={(e) => handleCaveSelect(Number(e.target.value))}
            className="w-full bg-gray-900 text-[#eae2c4] border border-gray-700 rounded px-3 py-2"
          >
            {Array.from({ length: 34 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Cave {num}</option>
            ))}
          </select>

          {/* Floor tabs (only if multiple floors) */}
          {hasMultipleFloors && (
            <div className="flex gap-2 overflow-x-auto">
              {cave?.plans?.map((plan) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    plan.floor_number === floorNumber
                      ? 'bg-[#487a14] text-white'
                      : 'bg-gray-800 text-[#eae2c4]'
                  }`}
                >
                  Floor {plan.floor_number}
                </button>
              ))}
            </div>
          )}

          <ImageDisplay
            image={displayedImage}
            cave={cave}
            floorNumber={floorNumber}
            onPrev={currentIndex > 0 ? goToPrevImage : undefined}
            onNext={currentIndex < floorImages.length - 1 ? goToNextImage : undefined}
            currentIndex={currentIndex}
            totalImages={floorImages.length}
          />

          <ImageInfoPanel
            image={displayedImage}
            cave={cave}
            collapsible
          />

          {currentPlan && (
            <details className="bg-gray-900 rounded-lg p-4" open={!hasMultipleFloors}>
              <summary className="cursor-pointer font-semibold">
                View Floor Plan
              </summary>
              <div className="mt-4">
                <InteractiveFloorPlan
                  plan={currentPlan}
                  images={floorImages}
                  selectedImageId={selectedImage?.id}
                  onImageSelect={handleImageSelect}
                  onImageHover={handleImageHover}
                />
              </div>
            </details>
          )}
        </div>

        {/* Bottom Gallery Strip (all layouts) */}
        <div className="mt-12 max-w-7xl mx-auto">
          <ImageGalleryStrip
            images={floorImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            cave={cave}
            floorNumber={floorNumber}
          />
        </div>
      </main>

      {/* Search Overlay */}
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onImageSelect={handleSearchSelect}
        />
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading...</div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
