// app/explore/page.tsx
'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import CaveMap from '@/components/cave/CaveMap';
import InteractiveFloorPlan from '@/components/cave/InteractiveFloorPlan';
import ImageDisplay from '@/components/cave/ImageDisplay';
import ImageInfoPanel from '@/components/cave/ImageInfoPanel';
import ImageGalleryStrip from '@/components/cave/ImageGalleryStrip';
import SearchOverlay from '@/components/search/SearchOverlay';
import GroupEditToolbar from '@/components/cave/GroupEditToolbar';
import GroupReviewOverlay from '@/components/cave/GroupReviewOverlay';
import { fetchCaveDetail, fetchCaveFloorImages, fetchCaveImages, fetchImageDetail, fetchCaveArchivalImages, fetchImageSiblingGroup, Cave, Image } from '@/lib/api';
import { supabase, batchUpdateBestId } from '@/lib/supabase';
import { getThumbnailUrl, getImageUrl } from '@/lib/cloudflare-images';
import { getDropdownLabel } from '@/components/cave/CaveMap';
import { buildGroupColorMap, getGroupMemberIds } from '@/lib/group-colors';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const caveId = searchParams.get('cave') || '10';
  const floorNumberParam = searchParams.get('floor');
  const imageId = searchParams.get('image');
  const editMode = searchParams.has('edit');
  const editSuffix = editMode ? '&edit' : '';
  
  const [cave, setCave] = useState<Cave | null>(null);
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [floorImages, setFloorImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [hoveredImage, setHoveredImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  interface ArchivalImage { id: number; thumbnail_url: string; image_url: string; subject?: string; }
  interface Model3DItem { model_id: number; title: string; file_url: string; poster_url: string | null; cave_id: number; }
  const [similarImages, setSimilarImages] = useState<Image[]>([]);
  const [archivalImages, setArchivalImages] = useState<ArchivalImage[]>([]);
  const [models3d, setModels3d] = useState<Model3DItem[]>([]);
  const [caveArchivalImages, setCaveArchivalImages] = useState<Image[]>([]);
  const [selectedArchival, setSelectedArchival] = useState<ArchivalImage | null>(null);
  const [selectedModel3d, setSelectedModel3d] = useState<Model3DItem | null>(null);

  // Edit mode state
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<number>>(new Set());
  const [placingImageId, setPlacingImageId] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);

  // Archival images filtered to the current floor's plan
  const currentPlanObj = cave?.plans?.find(p => p.floor_number === floorNumber);
  const floorArchivalImages = useMemo(
    () => {
      const planId = currentPlanObj?.id;
      return planId != null ? caveArchivalImages.filter(img => img.plan_id === planId) : [];
    },
    [caveArchivalImages, currentPlanObj?.id]
  );

  // Combined list of floor + archival images for grouping operations
  const allEditableImages = useMemo(
    () => {
      const seen = new Set(floorImages.map(img => img.id));
      const extra = floorArchivalImages.filter(img => !seen.has(img.id));
      return [...floorImages, ...extra];
    },
    [floorImages, floorArchivalImages]
  );

  const groupColorMap = useMemo(
    () => editMode ? buildGroupColorMap(allEditableImages) : undefined,
    [editMode, allEditableImages]
  );

  const handleToggleSelect = useCallback((id: number) => {
    setMultiSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleGroup = useCallback(async (bestId: number) => {
    // Build a lookup of existing groups by walking best_id pointers
    // across both floor and archival images.
    const imgById = new Map<number, Image>();
    const childrenOf = new Map<number, number[]>();
    allEditableImages.forEach(img => {
      imgById.set(img.id, img);
      if (img.best_id != null && img.best_id !== img.id) {
        const kids = childrenOf.get(img.best_id) || [];
        kids.push(img.id);
        childrenOf.set(img.best_id, kids);
      }
    });

    function findRoot(id: number): number {
      const visited = new Set<number>();
      let cur = id;
      while (true) {
        visited.add(cur);
        const parent = imgById.get(cur)?.best_id;
        if (parent == null || !imgById.has(parent) || visited.has(parent)) return cur;
        cur = parent;
      }
    }

    function collectDescendants(id: number, out: Set<number>) {
      out.add(id);
      (childrenOf.get(id) || []).forEach(kid => {
        if (!out.has(kid)) collectDescendants(kid, out);
      });
    }

    const allMemberIds = new Set<number>();
    Array.from(multiSelectedIds).forEach(id => {
      allMemberIds.add(id);
      const root = findRoot(id);
      collectDescendants(root, allMemberIds);
    });

    const memberIds = Array.from(allMemberIds);

    // Merge archival_ids and model3d_ids across ALL group members
    const mergedArchival = new Set<number>();
    const merged3d = new Set<number>();
    memberIds.forEach(id => {
      const img = imgById.get(id);
      if (img) {
        (img.archival_ids || []).forEach(aid => mergedArchival.add(aid));
        (img.model3d_ids || []).forEach(mid => merged3d.add(mid));
      }
    });
    const archArr = mergedArchival.size > 0 ? Array.from(mergedArchival).sort((a, b) => a - b) : null;
    const m3dArr = merged3d.size > 0 ? Array.from(merged3d).sort((a, b) => a - b) : null;

    // Optimistic UI update — apply to both floor and archival image lists
    const applyGroupUpdate = (img: Image) => {
      if (!allMemberIds.has(img.id)) return img;
      return { ...img, best_id: img.id === bestId ? null : bestId, archival_ids: archArr, model3d_ids: m3dArr };
    };
    setFloorImages(prev => prev.map(applyGroupUpdate));
    setCaveArchivalImages(prev => prev.map(applyGroupUpdate));
    setMultiSelectedIds(new Set());

    // Persist
    const bestIdUpdates = memberIds
      .filter(id => id !== bestId)
      .map(id => ({ imageId: id, bestId }));

    await Promise.all([
      batchUpdateBestId([...bestIdUpdates, { imageId: bestId, bestId: null }]),
      ...memberIds.map(id =>
        supabase.from('images').update({ archival_ids: archArr, model3d_ids: m3dArr }).eq('image_id', id)
      ),
    ]);
  }, [multiSelectedIds, allEditableImages]);

  const handleUngroup = useCallback(async () => {
    const updates = Array.from(multiSelectedIds).map(id => ({ imageId: id, bestId: null }));
    const applyUngroup = (img: Image) =>
      multiSelectedIds.has(img.id) ? { ...img, best_id: null } : img;
    setFloorImages(prev => prev.map(applyUngroup));
    setCaveArchivalImages(prev => prev.map(applyUngroup));
    setMultiSelectedIds(new Set());
    await batchUpdateBestId(updates);
  }, [multiSelectedIds]);

  const handleSelectGroup = useCallback((imageId: number) => {
    if (!groupColorMap) return;
    const members = getGroupMemberIds(imageId, groupColorMap);
    setMultiSelectedIds(members);
  }, [groupColorMap]);

  const handleChangeBest = useCallback(async (newBestId: number) => {
    if (!groupColorMap) return;
    const info = groupColorMap.get(newBestId);
    if (!info) return;
    const oldRootId = info.rootId;
    // The new best becomes the root: clear its best_id,
    // and point the old root to the new best.
    const updates: { imageId: number; bestId: number | null }[] = [
      { imageId: newBestId, bestId: null },
    ];
    if (oldRootId !== newBestId) {
      updates.push({ imageId: oldRootId, bestId: newBestId });
    }
    // Any image that pointed to newBestId should now point to oldRootId
    // (since newBestId is becoming the root, its former parent chain is intact
    //  except the old root now points down). But for images that had
    // best_id === newBestId (children of the new best), re-point them to
    // oldRootId so they stay one level deep under the new root via oldRootId.
    // Actually, the simplest correct approach: swap the root.
    // - newBestId.best_id = null (it's the new root)
    // - oldRootId.best_id = newBestId (old root becomes child of new root)
    // - Everything else stays the same (their best_id pointers still form a valid tree)
    const applyChangeBest = (img: Image) => {
      if (img.id === newBestId) return { ...img, best_id: null };
      if (img.id === oldRootId && oldRootId !== newBestId) return { ...img, best_id: newBestId };
      return img;
    };
    setFloorImages(prev => prev.map(applyChangeBest));
    setCaveArchivalImages(prev => prev.map(applyChangeBest));
    setMultiSelectedIds(new Set());
    await batchUpdateBestId(updates);
  }, [groupColorMap]);

  const handlePlaceMarker = useCallback(async (imageId: number, x: number, y: number) => {
    const apply = (img: Image) => img.id === imageId ? { ...img, mx: x, my: y } : img;
    setFloorImages(prev => prev.map(apply));
    setCaveArchivalImages(prev => prev.map(apply));
    setPlacingImageId(null);
    setMultiSelectedIds(new Set());
    const { error } = await supabase
      .from('images')
      .update({ mx: x, my: y })
      .eq('image_id', imageId);
    if (error) console.error('Failed to place marker:', error);
  }, []);

  const handleUpdateRank = useCallback(async (imageId: number, rank: number) => {
    const apply = (img: Image) => img.id === imageId ? { ...img, rank } : img;
    setFloorImages(prev => prev.map(apply));
    setCaveArchivalImages(prev => prev.map(apply));
    const { error } = await supabase
      .from('images')
      .update({ rank })
      .eq('image_id', imageId);
    if (error) console.error('Failed to update rank:', error);
  }, []);

  const handleUpdateArrayField = useCallback(async (imageId: number, field: 'archival_ids' | 'model3d_ids', ids: number[] | null) => {
    const apply = (img: Image) => img.id === imageId ? { ...img, [field]: ids } : img;
    setFloorImages(prev => prev.map(apply));
    setCaveArchivalImages(prev => prev.map(apply));
    const { error } = await supabase
      .from('images')
      .update({ [field]: ids })
      .eq('image_id', imageId);
    if (error) console.error(`Failed to update ${field}:`, error);
  }, []);

  type TextFieldName = 'subject' | 'description' | 'photographer' | 'medium';
  const handleUpdateTextField = useCallback(async (imageId: number, field: TextFieldName, value: string | null) => {
    const apply = (img: Image) => img.id === imageId ? { ...img, [field]: value || undefined } : img;
    setFloorImages(prev => prev.map(apply));
    setCaveArchivalImages(prev => prev.map(apply));
    const { error } = await supabase
      .from('images')
      .update({ [field]: value })
      .eq('image_id', imageId);
    if (error) console.error(`Failed to update ${field}:`, error);
  }, []);

  const handleToggleHidePlanXY = useCallback(async (imageId: number, currentValue: boolean) => {
    const newValue = !currentValue;
    const apply = (img: Image) => img.id === imageId ? { ...img, hide_plan_xy: newValue } : img;
    setFloorImages(prev => prev.map(apply));
    setCaveArchivalImages(prev => prev.map(apply));
    const { error } = await supabase
      .from('images')
      .update({ hide_plan_xy: newValue })
      .eq('image_id', imageId);
    if (error) console.error('Failed to toggle hide_plan_xy:', error);
  }, []);

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
      router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${prevImage.id}${editSuffix}`, { scroll: false });
    }
  }, [currentIndex, floorImages, caveId, floorNumber, editSuffix, router]);

  const goToNextImage = useCallback(() => {
    if (currentIndex < floorImages.length - 1) {
      const nextImage = floorImages[currentIndex + 1];
      setSelectedImage(nextImage);
      router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${nextImage.id}${editSuffix}`, { scroll: false });
    }
  }, [currentIndex, floorImages, caveId, floorNumber, editSuffix, router]);

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
          router.replace(`/explore?cave=${caveId}&floor=${lowestFloor}${editSuffix}`, { scroll: false });
        }
      } catch (error) {
        console.error('Error fetching cave:', error);
      }
    }
    loadCave();
  }, [caveId, floorNumberParam, router]);

  useEffect(() => {
    async function loadFloorImages() {
      if (!cave) return;
      try {
        const hasPlanForFloor = cave.plans?.some(p => p.floor_number === floorNumber);
        const [floorData, archival] = await Promise.all([
          fetchCaveFloorImages(caveId, floorNumber, editMode),
          fetchCaveArchivalImages(caveId),
        ]);
        // Caves without a floor plan still have images — fetch them all
        const data = floorData.length === 0 && !hasPlanForFloor
          ? await fetchCaveImages(caveId, 200)
          : floorData;
        setFloorImages(data);
        setCaveArchivalImages(archival);
        
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
  }, [cave, caveId, floorNumber, imageId, editMode]);

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

  // Fetch similar images (full best_id tree), archival images, and 3D models
  useEffect(() => {
    if (!displayedImage) {
      setSimilarImages([]);
      return;
    }
    let cancelled = false;
    fetchImageSiblingGroup(displayedImage.id, displayedImage.best_id).then(imgs => {
      if (!cancelled) setSimilarImages(imgs);
    });
    return () => { cancelled = true; };
  }, [displayedImage?.id, displayedImage?.best_id]);

  useEffect(() => {
    if (!selectedImage) {
      setArchivalImages([]);
      setModels3d([]);
      return;
    }
    const archIds: number[] = (selectedImage as any).archival_ids || [];
    const model3dIds: number[] = (selectedImage as any).model3d_ids || [];

    async function loadLinked() {
      if (archIds.length > 0) {
        const { data } = await supabase
          .from('images')
          .select('image_id, subject, cloudflare_image_id, file_path')
          .in('image_id', archIds);
        if (data) {
          setArchivalImages(data.map((r: any) => ({
            id: r.image_id,
            subject: r.subject || undefined,
            image_url: getImageUrl(r.cloudflare_image_id, r.file_path, 'large'),
            thumbnail_url: getThumbnailUrl(r.cloudflare_image_id, r.file_path),
          })));
        }
      } else {
        setArchivalImages([]);
      }

      if (model3dIds.length > 0) {
        const { data } = await supabase
          .from('models_3d')
          .select('model_id, title, file_url, poster_url, cave_id')
          .in('model_id', model3dIds);
        if (data) setModels3d(data as Model3DItem[]);
      } else {
        setModels3d([]);
      }
    }
    loadLinked();
  }, [selectedImage]);

  const handleCaveSelect = (newCaveId: number) => {
    router.push(`/explore?cave=${newCaveId}${editSuffix}`);
  };

  const handleFloorSelect = (newFloor: number) => {
    router.push(`/explore?cave=${caveId}&floor=${newFloor}${editSuffix}`);
  };

  const handleImageSelect = (image: Image) => {
    setSelectedImage(image);
    router.push(`/explore?cave=${caveId}&floor=${floorNumber}&image=${image.id}${editSuffix}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageHover = (image: Image | null) => {
    setHoveredImage(image);
  };

  const handleSaveMarkerPosition = useCallback(async (imageId: number, x: number, y: number) => {
    // Optimistic update so the marker moves immediately
    setFloorImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, mx: x, my: y } : img
    ));
    if (selectedImage?.id === imageId) {
      setSelectedImage(prev => prev ? { ...prev, mx: x, my: y } : prev);
    }
    const { error } = await supabase
      .from('images')
      .update({ mx: x, my: y })
      .eq('image_id', imageId);
    if (error) {
      console.error('Failed to save marker position:', error);
    }
  }, [selectedImage?.id]);

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
          <Link
            href="/more"
            className="px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all text-sm font-semibold"
          >
            More
          </Link>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black/90 hover:bg-black border-2 border-gray-600 hover:border-gray-400 rounded-lg text-white transition-all"
            title="Search images (Cmd/Ctrl + K)"
          >
            <Search className="h-5 w-5" />
            <span className="hidden lg:inline">Search</span>
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
              href="/more"
              className="px-3 py-2 bg-black/90 border border-gray-600 rounded-lg text-white text-sm"
            >
              More
            </Link>
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
        {/* Desktop Layout - changes based on plan availability */}
        {currentPlan ? (
            <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_320px] gap-6 max-w-7xl mx-auto items-start">
              {/* Column 1: Floor tabs + Interactive Floor Plan */}
              <div>
                {hasMultipleFloors && <div className="flex gap-1.5 mb-3">
                  {cave?.plans?.map((plan) => (
                    <button
                      key={plan.floor_number}
                      onClick={() => handleFloorSelect(plan.floor_number)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all ${
                        plan.floor_number === floorNumber
                          ? 'bg-white text-black border-white'
                          : 'bg-black/90 text-[#eae2c4] border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      Floor {plan.floor_number}
                    </button>
                  ))}
                </div>}
                <InteractiveFloorPlan
                  plan={currentPlan}
                  images={floorImages}
                  selectedImageId={selectedImage?.id}
                  onImageSelect={handleImageSelect}
                  onImageHover={handleImageHover}
                  editMode={editMode}
                  onSaveMarkerPosition={handleSaveMarkerPosition}
                  placingImageId={editMode ? placingImageId : undefined}
                  onPlaceMarker={editMode ? handlePlaceMarker : undefined}
                />
              </div>

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
                similarImages={similarImages}
                selectedImageId={selectedImage?.id}
                onImageSelect={handleImageSelect}
                archivalImages={archivalImages}
                onSelectArchival={setSelectedArchival}
                models3d={models3d}
                onSelectModel3d={setSelectedModel3d}
              />
            </div>
        ) : (
          /* No plan available: 2-column layout with image and info only */
          <div className="hidden lg:grid lg:grid-cols-[360px_320px] gap-6 max-w-3xl mx-auto items-start">
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
              similarImages={similarImages}
              selectedImageId={selectedImage?.id}
              onImageSelect={handleImageSelect}
              archivalImages={archivalImages}
              onSelectArchival={setSelectedArchival}
              models3d={models3d}
              onSelectModel3d={setSelectedModel3d}
            />
          </div>
        )}

        {/* Tablet Layout: 2 columns, stacked */}
        <div className="hidden md:block lg:hidden max-w-4xl mx-auto space-y-6">
          {/* Floor selector tabs */}
          {hasMultipleFloors && (
            <div className="flex gap-2 justify-center">
              {cave?.plans?.map((plan) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                    plan.floor_number === floorNumber
                      ? 'bg-white text-black border-white'
                      : 'bg-black/90 text-[#eae2c4] border-gray-600 hover:border-gray-400'
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
                editMode={editMode}
                onSaveMarkerPosition={handleSaveMarkerPosition}
                placingImageId={editMode ? placingImageId : undefined}
                onPlaceMarker={editMode ? handlePlaceMarker : undefined}
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
            similarImages={similarImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            archivalImages={archivalImages}
            onSelectArchival={setSelectedArchival}
            models3d={models3d}
            onSelectModel3d={setSelectedModel3d}
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

          {/* Floor tabs */}
          {hasMultipleFloors && (
            <div className="flex gap-2 overflow-x-auto">
              {cave?.plans?.map((plan) => (
                <button
                  key={plan.floor_number}
                  onClick={() => handleFloorSelect(plan.floor_number)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 whitespace-nowrap transition-all ${
                    plan.floor_number === floorNumber
                      ? 'bg-white text-black border-white'
                      : 'bg-black/90 text-[#eae2c4] border-gray-600 hover:border-gray-400'
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
            similarImages={similarImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            archivalImages={archivalImages}
            onSelectArchival={setSelectedArchival}
            models3d={models3d}
            onSelectModel3d={setSelectedModel3d}
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
                  editMode={editMode}
                  onSaveMarkerPosition={handleSaveMarkerPosition}
                  placingImageId={editMode ? placingImageId : undefined}
                  onPlaceMarker={editMode ? handlePlaceMarker : undefined}
                />
              </div>
            </details>
          )}
        </div>

        {/* Bottom Gallery Strip (all layouts) */}
        <div className="mt-12 max-w-7xl mx-auto">
          <ImageGalleryStrip
            images={floorImages}
            archivalImages={floorArchivalImages}
            selectedImageId={selectedImage?.id}
            onImageSelect={handleImageSelect}
            cave={cave}
            floorNumber={floorNumber}
            groupEditMode={editMode}
            multiSelectedIds={editMode ? multiSelectedIds : undefined}
            onToggleSelect={editMode ? handleToggleSelect : undefined}
            groupColorMap={groupColorMap}
            onUpdateRank={editMode ? handleUpdateRank : undefined}
            onToggleHidePlanXY={editMode ? handleToggleHidePlanXY : undefined}
          />
        </div>

        {/* Edit toolbar */}
        {editMode && (
          <GroupEditToolbar
            selectedIds={multiSelectedIds}
            images={allEditableImages}
            placingImageId={placingImageId}
            groupColorMap={groupColorMap}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
            onSelectGroup={handleSelectGroup}
            onChangeBest={handleChangeBest}
            onReview={() => setReviewing(true)}
            onClearSelection={() => setMultiSelectedIds(new Set())}
            onStartPlacing={(id) => { setPlacingImageId(id); setMultiSelectedIds(new Set()); }}
            onCancelPlacing={() => setPlacingImageId(null)}
          />
        )}
      </main>

      {/* Review overlay */}
      {reviewing && editMode && (
        <GroupReviewOverlay
          images={allEditableImages.filter(img => multiSelectedIds.has(img.id))}
          groupColorMap={groupColorMap}
          onClose={() => setReviewing(false)}
          onChangeBest={(id) => { handleChangeBest(id); }}
          onUpdateRank={handleUpdateRank}
          onToggleHidePlanXY={handleToggleHidePlanXY}
          onUpdateArrayField={handleUpdateArrayField}
          onUpdateTextField={handleUpdateTextField}
        />
      )}

      {/* Archival Image Lightbox */}
      {selectedArchival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setSelectedArchival(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedArchival(null)} className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 border border-gray-600 text-gray-300 hover:text-white flex items-center justify-center text-lg">&times;</button>
            <img src={selectedArchival.image_url} alt={selectedArchival.subject || 'Archival image'} className="w-full max-h-[85vh] object-contain rounded" />
            {selectedArchival.subject && <div className="mt-2 text-center text-sm text-gray-300">{selectedArchival.subject}</div>}
          </div>
        </div>
      )}

      {/* 3D Model Popup */}
      {selectedModel3d && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setSelectedModel3d(null)}>
          <div className="relative max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedModel3d(null)} className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 border border-gray-600 text-gray-300 hover:text-white flex items-center justify-center text-lg">&times;</button>
            <div className="bg-gray-950 rounded-t-lg" style={{ height: '60vh' }}>
              {/* @ts-expect-error model-viewer web component */}
              <model-viewer
                key={selectedModel3d.model_id}
                src={selectedModel3d.file_url}
                poster={selectedModel3d.poster_url || undefined}
                alt={selectedModel3d.title}
                camera-controls=""
                touch-action="pan-y"
                auto-rotate=""
                shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="bg-gray-900 rounded-b-lg px-4 py-3">
              <div className="text-sm text-[#eae2c4] font-medium">{selectedModel3d.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{getDropdownLabel(selectedModel3d.cave_id)}</div>
            </div>
          </div>
        </div>
      )}

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
