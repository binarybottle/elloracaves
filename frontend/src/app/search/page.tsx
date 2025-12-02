'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import { searchImages, SearchResult } from '@/lib/api';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query);

  // Perform search when query or page changes
  useEffect(() => {
    async function performSearch() {
      if (!query || query.trim() === '') {
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchImages(query, undefined, page);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Images
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for subjects, deities, descriptions..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
          
          {query && (
            <p className="text-gray-600 mt-4">
              Searching for: <span className="font-semibold">{query}</span>
            </p>
          )}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <p className="text-gray-500 text-sm mt-2">
              Please try again later
            </p>
          </div>
        ) : !query ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">Enter a search query to find images</p>
            <p className="text-gray-500 text-sm mt-2">
              Try searching for subjects, deities, or descriptions
            </p>
          </div>
        ) : results ? (
          <SearchResults
            results={results.results}
            total={results.total}
            page={results.page}
            pageSize={results.page_size}
            query={results.query}
          />
        ) : null}
      </div>
    </div>
  );
}
