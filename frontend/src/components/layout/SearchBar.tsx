/**
 * Search bar component for searching images across all caves.
 * 
 * Provides real-time search with keyboard navigation and redirects
 * to the search results page on submission.
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images by subject, motifs, or description..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-4 py-1.5 rounded-md hover:bg-primary-600 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
