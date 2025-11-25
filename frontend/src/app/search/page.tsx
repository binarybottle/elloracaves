import { Suspense } from 'react';
import Link from 'next/link';
import SearchResults from '@/components/search/SearchResults';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.API_URL || 'http://backend:8000/api/v1';

async function searchImages(query: string, page: number = 1) {
  if (!query || query.trim() === '') {
    return null;
  }

  try {
    const res = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(query)}&page=${page}&page_size=20`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) {
      console.error('Search failed:', res.status);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error searching:', error);
    return null;
  }
}

async function SearchContent({ 
  searchParams 
}: { 
  searchParams: { q?: string; page?: string } 
}) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1', 10);

  if (!query) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-600 text-lg">Enter a search query to find images</p>
        <p className="text-gray-500 text-sm mt-2">
          Try searching for subjects, deities, or descriptions
        </p>
      </div>
    );
  }

  const data = await searchImages(query, page);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-red-600 text-lg">Search failed</p>
        <p className="text-gray-500 text-sm mt-2">
          Please try again later
        </p>
      </div>
    );
  }

  return (
    <SearchResults
      results={data.results}
      total={data.total}
      page={data.page}
      pageSize={data.page_size}
      query={data.query}
    />
  );
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Search</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600">
              Searching for: <span className="font-semibold">{query}</span>
            </p>
          )}
        </div>

        {/* Search Results */}
        <Suspense fallback={<SearchLoading />}>
          <SearchContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  
  return {
    title: query ? `Search: ${query} - Ellora Caves` : 'Search - Ellora Caves',
    description: 'Search through the photographic documentation of Ellora cave temples',
  };
}
