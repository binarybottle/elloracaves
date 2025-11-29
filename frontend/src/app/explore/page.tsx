// app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import CaveMap, { CAVE_POSITIONS, getDropdownLabel } from '@/components/cave/CaveMap';
import FloorPlanSidebar from '@/components/cave/FloorPlanSidebar';
import InteractiveFloorPlan from '@/components/cave/InteractiveFloorPlan';
import ImageDisplay from '@/components/cave/ImageDisplay';
import ImageInfoPanel from '@/components/cave/ImageInfoPanel';
import ImageGalleryStrip from '@/components/cave/ImageGalleryStrip';
import SearchOverlay from '@/components/search/SearchOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const caveId = searchParams.get('cave') || '10';
  const floorNumber = parseInt(searchParams.get('floor') || '1');
  const imageId = searchParams.get('image');
  
  const [cave, setCave] = useState<any>(null);
  const [floorImages, setFloorImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [hoveredImage, setHoveredImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch cave data
  useEffect(() => {
    async function fetchCave() {
      try {
        // Clear selected image when changing caves
        setSelectedImage(null);
        setLoading(true);
        
        const res = await fetch(`${API_URL}/caves/${caveId}`);
        const data = await res.json();
        setCave(data);
        
        // Check if selected floor exists, if not redirect to first available floor
        if (data && data.plans && data.plans.length > 0) {
          const hasFloor = data.plans.some((p: any) => p.floor_number === floorNumber);
          if (!hasFloor) {
            // Redirect to first available floor for this cave
            const firstFloor = Math.min(...data.plans.map((p: any) => p.floor_number));
            router.replace(`/explore?cave=${caveId}&floor=${firstFloor}`);
          }
        }
      } catch (error) {
        console.error('Error fetching cave:', error);
      }
    }
    fetchCave();
  }, [caveId, floorNumber, router]);

  // Fetch floor images
  useEffect(() => {
    async function fetchFloorImages() {
      if (!cave) return;
      try {
        const res = await fetch(`${API_URL}/caves/${caveId}/floors/${floorNumber}/images`);
        const data = await res.json();
        setFloorImages(data);
        
        // Always select first VALID image when loading a new floor (unless specific imageId in URL)
        if (!imageId) {
          // Find first image with valid image_url
          const firstValidImage = data.find((img: any) => img.image_url && img.image_url.trim() !== '');
          if (firstValidImage) {
            setSelectedImage(firstValidImage);
          } else if (data.length > 0) {
            // Fallback to first image even if no image_url
            setSelectedImage(data[0]);
          } else {
            setSelectedImage(null);
          }
        }
      } catch (error) {
        console.error('Error fetching floor images:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFloorImages();
  }, [cave, caveId, floorNumber, imageId]);

  // Fetch specific image if imageId is in URL
  useEffect(() => {
    async function fetchImage() {
      if (!imageId) return;
      try {
        const res = await fetch(`${API_URL}/images/${imageId}`);
        if (!res.ok) {
          console.error('Failed to fetch image:', res.status);
          // Clear bad imageId from URL and let auto-selection take over
          router.replace(`/explore?cave=${caveId}&floor=${floorNumber}`, { scroll: false });
          return;
        }
        const data = await res.json();
        // Check if image has valid image_url
        if (data && data.id && data.image_url && data.image_url.trim() !== '') {
          setSelectedImage(data);
        } else {
          console.warn('Image has no valid URL:', data?.id);
          // Clear invalid imageId from URL and let auto-selection take over
          router.replace(`/explore?cave=${caveId}&floor=${floorNumber}`, { scroll: false });
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        // Clear bad imageId from URL on error
        router.replace(`/explore?cave=${caveId}&floor=${floorNumber}`, { scroll: false });
      }
    }
    fetchImage();
  }, [imageId, caveId, floorNumber, router]);

  const handleCaveSelect = (newCaveId: number) => {
    router.push(`/explore?cave=${newCaveId}&floor=1`);
  };

  const handleFloorSelect = (newFloor: number) => {
    router.push(`/explore?cave=${caveId}&floor=${newFloor}`);
  };

  const handleImageSelect = (image: any) => {
    // Don't select images without valid image_url
    if (!image || !image.image_url || image.image_url.trim() === '') {
      console.warn('Skipping image without valid URL:', image?.id);
      return;
    }
    // Immediately update the selected image
    setSelectedImage(image);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL to reflect selection (this will also trigger the image fetch useEffect)
    router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${image.id}`, { scroll: false });
  };

  const handleSearchSelect = (searchCaveId: number, searchFloorNumber: number, searchImageId: number) => {
    router.push(`/explore?cave=${searchCaveId}&floor=${searchFloorNumber}&image=${searchImageId}`);
  };

  // Navigate to previous/next image in gallery
  const navigateImage = (direction: 'prev' | 'next') => {
    const validImages = floorImages.filter(img => img.image_url && img.image_url.trim() !== '');
    if (validImages.length === 0) return;
    
    const currentIndex = validImages.findIndex(img => img.id === selectedImage?.id);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : validImages.length - 1;
    } else {
      newIndex = currentIndex < validImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    handleImageSelect(validImages[newIndex]);
  };

  // Keyboard shortcuts: Cmd/Ctrl + K for search, Arrow keys for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Search shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      
      // Arrow key navigation (only if not typing in an input)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateImage('next');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, floorImages]);

  const currentPlan = cave?.plans?.find((p: any) => p.floor_number === floorNumber);

  // Generate sorted list of all caves using the same logic as CaveMap
  const favoriteOrder = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1016,4016,3016,2016,17,18,19,120,220,21,22,23,24,124,224,25,26,27,28,29,30,130,31,32,33,34,10001,10006,10008,10013,10017,20001,20003];
  const allCaves = Object.entries(CAVE_POSITIONS).sort((a, b) => {
    const idA = Number(a[0]);
    const idB = Number(b[0]);
    const indexA = favoriteOrder.indexOf(idA);
    const indexB = favoriteOrder.indexOf(idB);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return idA - idB;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading...</div>
      </div>
    );
  }

  // If cave has no plans or selected floor doesn't exist, show message
  if (cave && (!cave.plans || cave.plans.length === 0)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-[#eae2c4]">
          <p className="text-xl mb-2">No floor plans available for Cave {caveId}</p>
          <button
            onClick={() => router.push('/explore?cave=10&floor=1')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            Go to Cave 10
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay 
          onClose={() => setSearchOpen(false)} 
          onImageSelect={handleSearchSelect}
        />
      )}

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
            onClick={() => setSearchOpen(true)}
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

      {/* Mobile Title, About, and Search - Only shown on mobile */}
      <div className="block md:hidden px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-[#eae2c4]">The Ellora caves</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="px-3 py-2 bg-black border-2 border-gray-600 rounded-lg text-white text-sm font-semibold"
            >
              About
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-black border-2 border-gray-600 rounded-lg text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-4 py-8">
        {/* Desktop Layout: 4-column grid or 3-column if single floor */}
        <div className={`hidden lg:grid gap-2 items-start ${
          cave?.plans?.length > 1 
            ? 'lg:grid-cols-[100px_1.5fr_3fr_280px]' 
            : 'lg:grid-cols-[1.5fr_3fr_280px]'
        }`}>
          {/* Column 1: Mini Floor Plans (only if multiple floors) - stays below map */}
          {cave?.plans?.length > 1 && (
            <FloorPlanSidebar
              floors={cave?.plans || []}
              selectedFloor={floorNumber}
              onSelectFloor={handleFloorSelect}
              caveId={caveId}
            />
          )}

          {/* Column 2: Interactive Floor Plan - RAISED to overlap map (only if multiple floors) */}
          <div style={{ marginTop: cave?.plans?.length > 1 ? '-65px' : '0' }}>
            {currentPlan && currentPlan.plan_image && 
             currentPlan.plan_image.trim() !== '' && 
             currentPlan.plan_image !== 'blank.png' && (
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                onImageHover={setHoveredImage}
              />
            )}
          </div>

          {/* Column 3: Main Image Display - RAISED to overlap map - show hovered OR selected */}
          <div style={{ marginTop: '-65px' }}>
            <ImageDisplay
              image={hoveredImage || selectedImage}
              cave={cave}
              floorNumber={floorNumber}
              onPrevImage={() => navigateImage('prev')}
              onNextImage={() => navigateImage('next')}
              showNavigation={!hoveredImage && !!selectedImage}
            />
          </div>

          {/* Column 4: Image Info Panel - stays below map - show info for hovered OR selected */}
          <ImageInfoPanel
            image={hoveredImage || selectedImage}
            cave={cave}
          />
        </div>

        {/* Tablet Layout: 2 columns, stacked */}
        <div className="hidden md:block lg:hidden space-y-6">
          {/* Floor selector tabs - only show if multiple floors */}
          {cave?.plans?.length > 1 && (
            <div className="flex gap-2 justify-center">
              {cave?.plans?.map((plan: any) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 rounded font-semibold ${
                    plan.floor_number === floorNumber
                      ? 'bg-white text-black'
                      : 'bg-black text-[#eae2c4] border border-gray-700'
                  }`}
                >
                  Floor {plan.floor_number}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {currentPlan && currentPlan.plan_image && 
             currentPlan.plan_image.trim() !== '' && 
             currentPlan.plan_image !== 'blank.png' && (
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                onImageHover={setHoveredImage}
              />
            )}
            <ImageDisplay
              image={hoveredImage || selectedImage}
              cave={cave}
              floorNumber={floorNumber}
              onPrevImage={() => navigateImage('prev')}
              onNextImage={() => navigateImage('next')}
              showNavigation={!hoveredImage && !!selectedImage}
            />
          </div>

          <ImageInfoPanel
            image={hoveredImage || selectedImage}
            cave={cave}
          />
        </div>

        {/* Mobile Layout: Vertical stack */}
        <div className="block md:hidden space-y-4">
          {/* Cave selector - includes all caves */}
          <select
            value={caveId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newCaveId = e.target.value;
              window.location.href = `/explore?cave=${newCaveId}&floor=1`;
            }}
            className="w-full bg-black text-white border-2 border-gray-600 rounded-lg px-4 py-2 text-base font-bold"
          >
            <option value="" disabled>Select a cave...</option>
            {allCaves.map(([caveId]) => (
              <option key={caveId} value={caveId}>
                {getDropdownLabel(Number(caveId))}
              </option>
            ))}
          </select>

          {/* Floor tabs - only show if multiple floors */}
          {cave?.plans?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {cave?.plans?.map((plan: any) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 rounded whitespace-nowrap font-semibold ${
                    plan.floor_number === floorNumber
                      ? 'bg-white text-black'
                      : 'bg-black text-[#eae2c4] border border-gray-700'
                  }`}
                >
                  Floor {plan.floor_number}
                </button>
              ))}
            </div>
          )}

          <ImageDisplay
            image={hoveredImage || selectedImage}
            cave={cave}
            floorNumber={floorNumber}
            onPrevImage={() => navigateImage('prev')}
            onNextImage={() => navigateImage('next')}
            showNavigation={!hoveredImage && !!selectedImage}
          />

          <ImageInfoPanel
            image={hoveredImage || selectedImage}
            cave={cave}
            collapsible
          />

          {currentPlan && currentPlan.plan_image && 
           currentPlan.plan_image.trim() !== '' && 
           currentPlan.plan_image !== 'blank.png' && (
            <details className="bg-black rounded-lg p-4 border border-gray-700" open>
              <summary className="cursor-pointer font-semibold text-[#eae2c4] text-lg">
                Floor Plan with Image Locations
              </summary>
              <div className="mt-4">
                <InteractiveFloorPlan
                  plan={currentPlan}
                  images={floorImages}
                  selectedImageId={selectedImage?.id}
                  onImageSelect={handleImageSelect}
                  onImageHover={setHoveredImage}
                />
              </div>
            </details>
          )}
        </div>

        {/* Bottom Gallery Strip (all layouts) */}
        <div className="mt-12">
          <ImageGalleryStrip
            images={floorImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            cave={cave}
            floorNumber={floorNumber}
          />
        </div>
      </main>
    </div>
  );
}