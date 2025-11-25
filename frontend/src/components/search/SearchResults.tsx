/**
 * Search results component displaying paginated search results with thumbnails.
 * 
 * Shows matched images in a grid with actual thumbnails and pagination controls.
 * Displays result count and provides navigation between pages.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageType {
  id: number;
  file_path: string;
  subject?: string;
  description?: string;
  cave_id?: number;
  image_url: string;
  thumbnail_url: string;
}

interface SearchResultsProps {
  results: Array<{ image: ImageType }>;
  total: number;
  page: number;
  pageSize: number;
  query: string;
}

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export default function SearchResults({ results, total, page, pageSize, query }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);
  
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };
  
  if (results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
        <p className="text-lg mb-2">No results found for &quot;{query}&quot;</p>
        <p className="text-sm">Try different keywords or check your spelling.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Results Header */}
      <div className="mb-6">
        <p className="text-gray-700">
          Found <span className="font-semibold">{total}</span> result{total !== 1 ? 's' : ''} for &quot;{query}&quot;
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {results.map(({ image }) => {
          const imageUrl = `${IMAGE_BASE_URL}${image.thumbnail_url || image.image_url}`;
          return (
            <Link
              key={image.id}
              href={`/images/${image.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={image.subject || 'Search result'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {image.subject || 'Untitled'}
                </p>
                <p className="text-sm text-gray-600 mb-2">Cave {image.cave_id}</p>
                {image.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {image.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    page === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
