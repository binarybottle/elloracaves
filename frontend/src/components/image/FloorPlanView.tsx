'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import { MapPin, Loader2 } from 'lucide-react';

interface Coordinates {
  plan_x_px?: number;
  plan_y_px?: number;
  plan_x_norm?: number;
  plan_y_norm?: number;
}

interface ImageType {
  id: number;
  file_path: string;
  subject?: string;
  description?: string;
  coordinates?: Coordinates;
  image_url: string;
  thumbnail_url: string;
}

interface Plan {
  id: number;
  floor_number: number;
  plan_image: string;
  plan_width: number;
  plan_height: number;
  image_count: number;
}

interface FloorPlanViewProps {
  plan: Plan;
  images: ImageType[];
  caveNumber: string;
  floorNumber: number;
}

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export default function FloorPlanView({ plan, images, caveNumber, floorNumber }: FloorPlanViewProps) {
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  const imagesWithCoords = images.filter(img => 
    img.coordinates?.plan_x_norm !== null && 
    img.coordinates?.plan_x_norm !== undefined &&
    img.coordinates?.plan_y_norm !== null && 
    img.coordinates?.plan_y_norm !== undefined
  );

  const planImageUrl = `${IMAGE_BASE_URL}/images/plans/${plan.plan_image}`;

  const handleImageLoad = () => {
    setLoadedImagesCount(prev => prev + 1);
  };

  const loadingProgress = images.length > 0 ? Math.round((loadedImagesCount / images.length) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Loading Progress Bar */}
      {loadedImagesCount < images.length && images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Loading images...</span>
            <span>{loadedImagesCount} / {images.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Floor Plan with Markers */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Interactive Floor Plan</h2>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: `${plan.plan_width}/${plan.plan_height}` }}>
          {/* Loading Spinner for Floor Plan */}
          {!planLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
            </div>
          )}

          {/* Floor Plan Image */}
          <ImageWithFallback
            src={planImageUrl}
            alt={`Floor ${floorNumber} plan`}
            fill
            className="object-contain"
            onLoad={() => setPlanLoaded(true)}
          />

          {/* Image Markers - Only show when plan is loaded */}
          {planLoaded && imagesWithCoords.map((img) => {
            const x = (img.coordinates!.plan_x_norm! * 100);
            const y = (img.coordinates!.plan_y_norm! * 100);
            const isHovered = hoveredImageId === img.id;
            const isSelected = selectedImageId === img.id;

            return (
              <Link
                key={img.id}
                href={`/images/${img.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  zIndex: isHovered || isSelected ? 20 : 10,
                }}
                onMouseEnter={() => setHoveredImageId(img.id)}
                onMouseLeave={() => setHoveredImageId(null)}
                onClick={() => setSelectedImageId(img.id)}
              >
                <div className={`relative ${isHovered || isSelected ? 'scale-125' : 'scale-100'} transition-transform`}>
                  <MapPin
                    className={`h-8 w-8 ${
                      isSelected
                        ? 'text-red-600'
                        : isHovered
                        ? 'text-primary-600'
                        : 'text-primary-500'
                    } drop-shadow-lg`}
                    fill={isHovered || isSelected ? 'currentColor' : 'white'}
                  />
                  {(isHovered || isSelected) && img.subject && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-30 shadow-lg">
                      {img.subject}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Showing {imagesWithCoords.length} of {images.length} images with location markers
          </p>
          {images.length > imagesWithCoords.length && (
            <p className="text-gray-500">
              {images.length - imagesWithCoords.length} images don't have floor plan coordinates yet
            </p>
          )}
        </div>
      </div>

      {/* Image Grid with Loading States */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Images on This Floor</h3>
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No images found for this floor</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <Link
                key={img.id}
                href={`/images/${img.id}`}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                onMouseEnter={() => setHoveredImageId(img.id)}
                onMouseLeave={() => setHoveredImageId(null)}
              >
                {/* Actual Image with Loading State */}
                <ImageWithFallback
                  src={`${IMAGE_BASE_URL}${img.image_url}`}
                  alt={img.subject || `Image ${img.id}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onLoad={handleImageLoad}
                />
                
                {img.subject && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{img.subject}</p>
                  </div>
                )}
                {img.coordinates && (
                  <div className="absolute top-2 right-2">
                    <MapPin className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
