'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, Clock, Loader2 } from 'lucide-react';
import ImageWithFallback from '@/components/image/ImageWithFallback';

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const RECENT_SEARCHES_KEY = 'ellora_recent_searches';
const MAX_RECENT = 10;

interface SearchOverlayProps {
  onClose: () => void;
  onImageSelect: (caveId: number, floorNumber: number, imageId: number) => void;
}

export default function SearchOverlay({ onClose, onImageSelect }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCave, setSelectedCave] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    inputRef.current?.focus();
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSuggestions) {
          setShowSuggestions(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showSuggestions]);

  // Generate autocomplete suggestions
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const commonTerms = [
      'Buddha', 'Bodhisattva', 'Shiva', 'Vishnu', 'Mahavira', 'Ganesha', 'Durga',
      'stupa', 'mandala', 'lotus', 'dancing', 'seated', 'standing',
      'carved', 'relief', 'sculpture', 'panel', 'shrine', 'column', 'pillar',
      'facade', 'ceiling', 'wall', 'entrance', 'doorway'
    ];

    const lastWord = query.split(/\s+/).pop()?.toLowerCase() || '';
    const matches = commonTerms.filter(term => 
      term.toLowerCase().startsWith(lastWord) && 
      term.toLowerCase() !== lastWord
    ).slice(0, 5);

    setSuggestions(matches);
  }, [query]);

  // Parse advanced syntax
  const parseQuery = (q: string) => {
    let parsedQuery = q;
    let caveFilter = selectedCave;
    let floorFilter = selectedFloor;

    // Extract cave:N syntax
    const caveMatch = q.match(/cave:(\d+)/i);
    if (caveMatch) {
      caveFilter = caveMatch[1];
      parsedQuery = q.replace(/cave:\d+/gi, '').trim();
    }

    // Extract floor:N syntax
    const floorMatch = q.match(/floor:(\d+)/i);
    if (floorMatch) {
      floorFilter = floorMatch[1];
      parsedQuery = q.replace(/floor:\d+/gi, '').trim();
    }

    // Extract subject:term syntax
    const subjectMatch = q.match(/subject:"([^"]+)"|subject:(\S+)/i);
    if (subjectMatch) {
      const term = subjectMatch[1] || subjectMatch[2];
      parsedQuery = q.replace(/subject:"[^"]+"|subject:\S+/gi, term).trim();
    }

    return { query: parsedQuery, cave: caveFilter, floor: floorFilter };
  };

  // Debounced search with filters and pagination
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setPage(1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { query: parsedQuery, cave, floor } = parseQuery(query);
        
        // Build query params
        const params = new URLSearchParams({
          q: parsedQuery,
          page: page.toString(),
          page_size: '100'
        });
        
        if (cave) params.append('cave_id', cave);
        if (floor) params.append('floor_number', floor);
        
        const res = await fetch(`${API_URL}/search?${params}`);
        const data = await res.json();
        
        const newResults = data.results || [];
        const allResults = page === 1 ? newResults : [...results, ...newResults];
        
        setResults(allResults);
        setTotal(data.total || 0);
        setHasMore(allResults.length < (data.total || 0));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCave, selectedFloor, page]);

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, MAX_RECENT);
    
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleImageClick = async (image: any) => {
    // Save search to recent
    saveRecentSearch(query);
    
    // Fetch full image details to get floor number
    try {
      const res = await fetch(`${API_URL}/images/${image.image.id}`);
      const imageData = await res.json();
      onImageSelect(
        imageData.cave_id,
        imageData.floor_number || 1,
        imageData.id
      );
      onClose();
    } catch (error) {
      console.error('Error fetching image details:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const words = query.split(/\s+/);
    words[words.length - 1] = suggestion;
    setQuery(words.join(' ') + ' ');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRecentClick = (recent: string) => {
    setQuery(recent);
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-black border-2 border-gray-700 rounded-lg shadow-2xl mt-8 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Search Images</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close search"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by subject, description, motifs... (try: Buddha AND stupa)"
              className="w-full bg-gray-900 text-white border-2 border-gray-700 rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-2 py-1">Suggestions</div>
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-white text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                {!query && recentSearches.length > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <div className="text-xs text-gray-500 px-2 py-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </div>
                    {recentSearches.map((recent, i) => (
                      <button
                        key={i}
                        onClick={() => handleRecentClick(recent)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-white text-sm"
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Filters */}
          <div className="mt-3 flex gap-2">
            <select
              value={selectedCave}
              onChange={(e) => {
                setSelectedCave(e.target.value);
                setPage(1);
              }}
              className="bg-gray-900 text-white border-2 border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">All Caves</option>
              {[...Array(34)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Cave {i + 1}</option>
              ))}
            </select>
            
            <select
              value={selectedFloor}
              onChange={(e) => {
                setSelectedFloor(e.target.value);
                setPage(1);
              }}
              className="bg-gray-900 text-white border-2 border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>
          
          {/* Search Tips */}
          <div className="mt-2 text-xs text-gray-400">
            <span className="font-semibold">Advanced:</span> <code className="bg-gray-800 px-1 rounded">cave:16</code>, <code className="bg-gray-800 px-1 rounded">subject:Buddha</code> • Use <code className="bg-gray-800 px-1 rounded">AND</code>, <code className="bg-gray-800 px-1 rounded">OR</code>, <code className="bg-gray-800 px-1 rounded">NOT</code>
          </div>
        </div>

        {/* Results */}
        <div className="p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-600 border-r-transparent"></div>
              <p className="text-gray-400 mt-2">Searching...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No results found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="mb-4 text-gray-400">
                Showing {results.length} of {total} result{total !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((result) => {
                  const img = result.image;
                  return (
                    <button
                      key={img.id}
                      onClick={() => handleImageClick(result)}
                      className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-gray-500 transition-all"
                    >
                      <div className="aspect-square relative">
                        <ImageWithFallback
                          src={`${IMAGE_BASE_URL}${img.thumbnail_url || img.image_url}`}
                          alt={img.subject || `Image ${img.id}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {img.subject && (
                        <div className="p-2 text-xs text-gray-300 line-clamp-2">
                          {img.subject}
                        </div>
                      )}
                      <div className="absolute top-1 right-1 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                        Cave {img.cave_id}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ChevronDown className="h-5 w-5" />
                    Load More ({total - results.length} remaining)
                  </button>
                </div>
              )}
              
              <div ref={resultsEndRef} />
            </>
          )}
          
          {loading && page > 1 && (
            <div className="text-center py-4 mt-4">
              <Loader2 className="inline-block h-6 w-6 animate-spin text-gray-600" />
              <p className="text-gray-400 mt-2">Loading more...</p>
            </div>
          )}

          {!query && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Start typing to search images</p>
              <p className="text-gray-500 text-sm mt-2">Search by subject, description, motifs, or keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

