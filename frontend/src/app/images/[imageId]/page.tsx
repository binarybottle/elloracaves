/**
 * Image detail page displaying full-size image with complete metadata.
 * 
 * Shows the actual image at full resolution, subject, description, motifs, medium,
 * and provides navigation back to the cave and floor plan context.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Download } from 'lucide-react';
import { fetchImageDetail, fetchCaveDetail, fetchCaveFloorImages, ImageDetail } from '@/lib/api';

// Use edge runtime for Cloudflare Pages
export const runtime = 'edge';

interface ImagePageProps {
  params: Promise<{
    imageId: string;
  }>;
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { imageId } = await params;
  let image: ImageDetail;
  
  try {
    image = await fetchImageDetail(parseInt(imageId, 10));
  } catch (error) {
    notFound();
  }
  
  if (!image) {
    notFound();
  }
  
  // Fetch cave info and related images
  let cave = null;
  let relatedImages: any[] = [];
  
  try {
    cave = await fetchCaveDetail(String(image.cave_id));
  } catch (error) {
    console.error('Error fetching cave:', error);
  }
  
  try {
    if (image.floor_number) {
      const floorImages = await fetchCaveFloorImages(String(image.cave_id), image.floor_number);
      relatedImages = floorImages.filter(img => img.id !== image.id).slice(0, 6);
    }
  } catch (error) {
    console.error('Error fetching related images:', error);
  }
  
  // Image URL is already full URL from API
  const fullImageUrl = image.image_url;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={`/explore?cave=${image.cave_id}&floor=1`}
            className="text-primary-600 hover:text-primary-700"
          >
            {cave?.name || `Cave ${image.cave_id}`}
          </Link>
          {image.floor_number && (
            <>
              <span className="text-gray-400">/</span>
              <Link
                href={`/explore?cave=${image.cave_id}&floor=${image.floor_number}`}
                className="text-primary-600 hover:text-primary-700"
              >
                Floor {image.floor_number}
              </Link>
            </>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Image {image.id}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                <img
                  src={fullImageUrl}
                  alt={image.subject || 'Cave image'}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="mt-4 flex gap-4">
              <Link
                href={`/explore?cave=${image.cave_id}&floor=${image.floor_number || 1}`}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-center flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cave
              </Link>
              {image.coordinates && image.floor_number && (
                <Link
                  href={`/explore?cave=${image.cave_id}&floor=${image.floor_number}&image=${image.id}`}
                  className="flex-1 px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Show on Floor Plan
                </Link>
              )}
              <a
                href={fullImageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                title="Download image"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Metadata Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {image.subject || 'Untitled'}
              </h1>

              {image.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{image.description}</p>
                </div>
              )}

              {image.motifs && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Motifs</h2>
                  <div className="flex flex-wrap gap-2">
                    {image.motifs.split(',').map((motif, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {motif.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {image.medium && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Medium</h2>
                  <p className="text-gray-700">{image.medium}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Location</h2>
                <p className="text-gray-700">
                  {cave?.name || `Cave ${image.cave_id}`}
                </p>
                {image.floor_number && (
                  <p className="text-sm text-gray-600 mt-1">
                    Floor {image.floor_number}
                  </p>
                )}
                {image.coordinates && (
                  <p className="text-sm text-gray-500 mt-1">
                    Coordinates: ({image.coordinates.plan_x_norm?.toFixed(3)}, {image.coordinates.plan_y_norm?.toFixed(3)})
                  </p>
                )}
              </div>

              {image.photographer && (
                <div className="pt-6 border-t border-gray-200 mt-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Photographer</h2>
                  <p className="text-sm text-gray-600">{image.photographer}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200 mt-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">File Information</h2>
                <p className="text-sm text-gray-600 break-all">{image.file_path}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Images */}
        {relatedImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More from this floor
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedImages.map((relImg) => (
                <Link
                  key={relImg.id}
                  href={`/images/${relImg.id}`}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={relImg.thumbnail_url || relImg.image_url}
                    alt={relImg.subject || `Image ${relImg.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {relImg.subject && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{relImg.subject}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ImagePageProps) {
  const { imageId } = await params;
  try {
    const image = await fetchImageDetail(parseInt(imageId, 10));
    
    return {
      title: `${image.subject || `Image ${image.id}`} - Ellora Caves`,
      description: image.description || `View image from Ellora Caves`,
    };
  } catch (error) {
    return { title: 'Image Not Found' };
  }
}
