/**
 * API client for Ellora Caves
 * 
 * This module provides type-safe functions for all data operations.
 * Uses Supabase for database queries and Cloudflare Images for image delivery.
 */

import { 
  getCaves as dbGetCaves, 
  getCave as dbGetCave, 
  getCaveFloorImages as dbGetCaveFloorImages,
  getImage as dbGetImage,
  searchImages as dbSearchImages,
  getAllCaveIds as dbGetAllCaveIds,
  DbCave, 
  DbPlan, 
  DbImage 
} from './supabase';

import { 
  getImageUrl, 
  getThumbnailUrl, 
  getPlanImageUrl,
  ImageVariant 
} from './cloudflare-images';

// ============================================
// Type Definitions (API response types)
// ============================================

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

export interface ImageDetail extends Image {
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
  plan_url: string;
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

// ============================================
// Transform Functions (DB -> API types)
// ============================================

function transformCave(dbCave: DbCave & { plans?: DbPlan[]; images?: { count: number }[] }): Cave {
  // Filter out plans with blank.png (placeholder for no plan)
  const validPlans = dbCave.plans?.filter(p => p.plan_image && p.plan_image !== 'blank.png');
  
  return {
    id: dbCave.cave_id,
    cave_number: String(dbCave.cave_id),
    name: dbCave.cave_name || `Cave ${dbCave.cave_id}`,
    tradition: dbCave.cave_religion || '',
    date_range: dbCave.cave_dates || undefined,
    description: dbCave.cave_description || undefined,
    floor_count: validPlans?.length || 0,
    image_count: dbCave.images?.[0]?.count || 0,
    plans: validPlans?.map(transformPlan),
  };
}

function transformPlan(dbPlan: DbPlan & { image_count?: number }): FloorPlan {
  return {
    id: dbPlan.plan_id,
    floor_number: dbPlan.plan_floor,
    plan_image: dbPlan.plan_image || '',
    plan_url: getPlanImageUrl(dbPlan.plan_image),
    plan_width: dbPlan.plan_width || 0,
    plan_height: dbPlan.plan_height || 0,
    image_count: dbPlan.image_count || 0,
  };
}

function transformImage(dbImage: DbImage): Image {
  return {
    id: dbImage.image_id,
    file_path: dbImage.file_path,
    subject: dbImage.subject || undefined,
    description: dbImage.description || undefined,
    cave_id: dbImage.cave_id,
    coordinates: dbImage.plan_x_px ? {
      plan_x_px: dbImage.plan_x_px,
      plan_y_px: dbImage.plan_y_px || undefined,
      plan_x_norm: dbImage.plan_x_norm || undefined,
      plan_y_norm: dbImage.plan_y_norm || undefined,
    } : undefined,
    image_url: getImageUrl(dbImage.cloudflare_image_id, dbImage.file_path, 'large'),
    thumbnail_url: getThumbnailUrl(
      dbImage.cloudflare_image_id,
      dbImage.cloudflare_thumbnail_id,
      dbImage.file_path,
      dbImage.thumbnail
    ),
  };
}

function transformImageDetail(
  dbImage: DbImage & { 
    caves?: { cave_name: string; cave_religion: string }; 
    plans?: { plan_floor: number } 
  }
): ImageDetail {
  const base = transformImage(dbImage);
  return {
    ...base,
    motifs: dbImage.motifs || undefined,
    medium: dbImage.medium || undefined,
    plan_id: dbImage.plan_id || undefined,
    floor_number: dbImage.plans?.plan_floor,
    photographer: dbImage.photographer || undefined,
  };
}

// ============================================
// API Functions (public interface)
// ============================================

/**
 * Fetch all caves, optionally filtered by tradition
 */
export async function fetchCaves(tradition?: string): Promise<Cave[]> {
  const data = await dbGetCaves(tradition);
  return data?.map(transformCave) || [];
}

/**
 * Fetch a single cave with its floor plans
 */
export async function fetchCaveDetail(caveNumber: string): Promise<Cave> {
  const caveId = parseInt(caveNumber, 10);
  const data = await dbGetCave(caveId);
  
  if (!data) {
    throw new Error(`Cave ${caveNumber} not found`);
  }
  
  return transformCave(data);
}

/**
 * Fetch images for a specific cave floor
 */
export async function fetchCaveFloorImages(caveNumber: string, floorNumber: number): Promise<Image[]> {
  const caveId = parseInt(caveNumber, 10);
  const data = await dbGetCaveFloorImages(caveId, floorNumber);
  return data?.map(transformImage) || [];
}

/**
 * Fetch details for a single image
 */
export async function fetchImageDetail(imageId: number): Promise<ImageDetail> {
  const data = await dbGetImage(imageId);
  
  if (!data) {
    throw new Error(`Image ${imageId} not found`);
  }
  
  return transformImageDetail(data);
}

/**
 * Search images by query string
 */
export async function searchImages(query: string, caveId?: number, page: number = 1): Promise<SearchResult> {
  const result = await dbSearchImages(query, caveId, page);
  
  return {
    results: result.results.map(img => ({ image: transformImage(img) })),
    total: result.total,
    page: result.page,
    page_size: result.pageSize,
    query: result.query,
  };
}

/**
 * Get all cave IDs for static generation
 */
export async function getAllCaveIds(): Promise<string[]> {
  const ids = await dbGetAllCaveIds();
  return ids.map(String);
}
