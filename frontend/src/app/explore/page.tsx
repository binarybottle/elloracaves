// app/explore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaveMap from '@/components/cave/CaveMap';
import FloorPlanSidebar from '@/components/cave/FloorPlanSidebar';
import InteractiveFloorPlan from '@/components/cave/InteractiveFloorPlan';
import ImageDisplay from '@/components/cave/ImageDisplay';
import ImageInfoPanel from '@/components/cave/ImageInfoPanel';
import ImageGalleryStrip from '@/components/cave/ImageGalleryStrip';

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

  // Fetch cave data
  useEffect(() => {
    async function fetchCave() {
      try {
        const res = await fetch(`${API_URL}/caves/${caveId}`);
        const data = await res.json();
        setCave(data);
      } catch (error) {
        console.error('Error fetching cave:', error);
      }
    }
    fetchCave();
  }, [caveId]);

  // Fetch floor images
  useEffect(() => {
    async function fetchFloorImages() {
      if (!cave) return;
      try {
        const res = await fetch(`${API_URL}/caves/${caveId}/floors/${floorNumber}/images`);
        const data = await res.json();
        setFloorImages(data);
        
        // Select first image if none selected
        if (!imageId && data.length > 0) {
          setSelectedImage(data[0]);
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
        const data = await res.json();
        setSelectedImage(data);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    }
    fetchImage();
  }, [imageId]);

  const handleCaveSelect = (newCaveId: number) => {
    router.push(`/explore?cave=${newCaveId}&floor=1`);
  };

  const handleFloorSelect = (newFloor: number) => {
    router.push(`/explore?cave=${caveId}&floor=${newFloor}`);
  };

  const handleImageSelect = (image: any) => {
    setSelectedImage(image);
    router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${image.id}`, { scroll: false });
  };

  const currentPlan = cave?.plans?.find((p: any) => p.floor_number === floorNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#eae2c4]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#eae2c4]">
      {/* Header Section with Cave Map */}
      <header className="relative">
        {/* Title and Links */}
        <div className="absolute left-5 top-4 z-20">
          <h1 className="text-2xl mb-2">The Ellora caves</h1>
          <div className="text-sm space-x-5">
            <a href="/about" className="text-[#487a14] hover:text-[#6ebd20]">about</a>
            <a href="/help" className="text-[#487a14] hover:text-[#6ebd20]">help</a>
          </div>
        </div>

        {/* Cave Map with clickable numbers */}
        <CaveMap 
          selectedCaveId={parseInt(caveId)} 
          className="w-full max-w-[1024px]"
        />
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-8">
        {/* Desktop Layout: 4-column grid */}
        <div className="hidden lg:grid lg:grid-cols-[120px_1fr_360px_320px] gap-6 max-w-7xl mx-auto">
          {/* Column 1: Mini Floor Plans */}
          <FloorPlanSidebar
            floors={cave?.plans || []}
            selectedFloor={floorNumber}
            onSelectFloor={handleFloorSelect}
            caveId={caveId}
          />

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
        <div className="hidden md:block lg:hidden max-w-4xl mx-auto space-y-6">
          {/* Floor selector tabs */}
          <div className="flex gap-2 justify-center">
            {cave?.plans?.map((plan: any) => (
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
        <div className="block md:hidden max-w-2xl mx-auto space-y-4">
          {/* Cave selector */}
          <select
            value={caveId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCaveSelect(Number(e.target.value))}
            className="w-full bg-gray-900 text-[#eae2c4] border border-gray-700 rounded px-3 py-2"
          >
            {Array.from({ length: 34 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Cave {num}</option>
            ))}
          </select>

          {/* Floor tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {cave?.plans?.map((plan: any) => (
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
            <details className="bg-gray-900 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold">
                View Floor Plan
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
    </div>
  );
}