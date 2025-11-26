/**
 * API client for Ellora Caves backend.
 * Provides type-safe functions for all API endpoints.
 * Uses different URLs for server-side (Docker network) vs client-side (browser) requests.
 */

// Use API_URL for server-side, NEXT_PUBLIC_API_URL for client-side
const getApiUrl = () => {
  // Server-side: use internal Docker network URL
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://backend:8000/api/v1';
  }
  // Client-side: use public URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
};

// Type Definitions
export interface Coordinates {
  plan_x_px?: number;
  plan_y_px?: number;
  plan_x_norm?: number;
  plan_y_norm?: number;
}

export interface Image {
  id: number;
  file_path: string;
  subject?: string;
  description?: string;
  cave_id: number;
  coordinates?: Coordinates;
  image_url: string;
  thumbnail_url: string;
}

interface ImageDetail extends Image {
  motifs?: string;
  medium?: string;
  plan_id?: number;
  floor_number?: number;
  photographer?: string;
}
export interface FloorPlan {
  id: number;
  floor_number: number;
  plan_image: string;
  plan_width: number;
  plan_height: number;
  image_count: number;
}

export interface Cave {
  id: number;
  cave_number: string;
  name: string;
  tradition: string;
  date_range?: string;
  description?: string;
  image_count?: number;
  floor_count?: number;
  plans?: FloorPlan[];
}

export interface SearchResult {
  results: Array<{ image: Image }>;
  total: number;
  page: number;
  page_size: number;
  query: string;
}

// API Functions
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}${endpoint}`, {
    // Disable caching for development
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchCaves(tradition?: string): Promise<Cave[]> {
  const params = tradition ? `?tradition=${encodeURIComponent(tradition)}` : '';
  return fetchAPI<Cave[]>(`/caves${params}`);
}

export async function fetchCaveDetail(caveNumber: string): Promise<Cave> {
  return fetchAPI<Cave>(`/caves/${caveNumber}`);
}

export async function fetchImageDetail(imageId: number): Promise<ImageDetail> {
  return fetchAPI<ImageDetail>(`/images/${imageId}`);
}

export async function searchImages(query: string, caveId?: number, page: number = 1): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query, page: page.toString() });
  if (caveId) {
    params.append('cave_id', caveId.toString());
  }
  return fetchAPI<SearchResult>(`/search?${params.toString()}`);
}
