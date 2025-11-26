// app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import CaveMap from '@/components/cave/CaveMap';
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
  
  const [cave, setCave] = useState(null);
  const [floorImages, setFloorImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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
        
        // Check if selected floor exists, if not redirect to floor 1
        if (data && data.plans && data.plans.length > 0) {
          const hasFloor = data.plans.some((p: any) => p.floor_number === floorNumber);
          if (!hasFloor) {
            // Redirect to floor 1 of this cave
            router.replace(`/explore?cave=${caveId}&floor=1`);
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
    // Update URL to reflect selection (this will also trigger the image fetch useEffect)
    router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${image.id}`, { scroll: false });
  };

  const handleSearchSelect = (searchCaveId: number, searchFloorNumber: number, searchImageId: number) => {
    router.push(`/explore?cave=${searchCaveId}&floor=${searchFloorNumber}&image=${searchImageId}`);
  };

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const currentPlan = cave?.plans?.find((p: any) => p.floor_number === floorNumber);

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
        {/* Title and Search Button */}
        <div className="absolute left-5 top-4 z-20 flex items-center gap-4">
          <h1 className="text-3xl">The Ellora caves</h1>
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

      {/* Mobile Title and Search - Only shown on mobile */}
      <div className="block md:hidden px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-[#eae2c4]">The Ellora caves</h1>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-black border-2 border-gray-600 rounded-lg text-white"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-4 py-8">
        {/* Desktop Layout: 4-column grid or 3-column if single floor */}
        <div className={`hidden lg:grid gap-6 items-start ${
          cave?.plans?.length > 1 
            ? 'lg:grid-cols-[120px_2fr_2fr_320px]' 
            : 'lg:grid-cols-[2fr_2fr_320px]'
        }`}>
          {/* Column 1: Mini Floor Plans (only if multiple floors) */}
          {cave?.plans?.length > 1 && (
            <FloorPlanSidebar
              floors={cave?.plans || []}
              selectedFloor={floorNumber}
              onSelectFloor={handleFloorSelect}
              caveId={caveId}
            />
          )}

          {/* Column 2: Interactive Floor Plan */}
          {currentPlan && (
            <InteractiveFloorPlan
              plan={currentPlan}
              images={floorImages}
              selectedImageId={selectedImage?.id}
              onImageSelect={handleImageSelect}
            />
          )}

          {/* Column 3: Main Image Display */}
          <ImageDisplay
            image={selectedImage}
            cave={cave}
            floorNumber={floorNumber}
          />

          {/* Column 4: Image Info Panel */}
          <ImageInfoPanel
            image={selectedImage}
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
            {currentPlan && (
              <InteractiveFloorPlan
                plan={currentPlan}
                images={floorImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
              />
            )}
            <ImageDisplay
              image={selectedImage}
              cave={cave}
              floorNumber={floorNumber}
            />
          </div>

          <ImageInfoPanel
            image={selectedImage}
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
            {/* All main caves 1-34 */}
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34].map(num => (
              <option key={num} value={num}>Cave {num}</option>
            ))}
            {/* Extra caves */}
            <option value="1016">Cave 16: Lankeshvara</option>
            <option value="4016">16: southwest satellite</option>
            <option value="3016">16: southeast satellite</option>
            <option value="2016">16: north satellite</option>
            <option value="120">Cave 20 A</option>
            <option value="124">24 A shrine 1</option>
            <option value="224">24 A shrine 2</option>
            <option value="130">Cave 30 A</option>
            <option value="132">32 Yadavas</option>
            <option value="10001">Ganeshleni 1-5</option>
            <option value="10006">Ganeshleni 6-7</option>
            <option value="10008">Ganeshleni 8-12</option>
            <option value="10013">Ganeshleni 13-16</option>
            <option value="10017">Ganeshleni 17-19</option>
            <option value="20001">Jogeshwari 1-2</option>
            <option value="20003">Jogeshwari 3-4</option>
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
            image={selectedImage}
            cave={cave}
            floorNumber={floorNumber}
          />

          <ImageInfoPanel
            image={selectedImage}
            cave={cave}
            collapsible
          />

          {currentPlan && (
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