/**
 * Supabase Client for Ellora Caves
 * 
 * This module provides a typed Supabase client for accessing the database.
 * Uses environment variables for configuration.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables (set these in .env.local or Cloudflare Pages settings)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single Supabase client for the entire app
// During build time without credentials, queries will fail gracefully
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client for build time - queries will fail but build will succeed
  console.warn('Supabase credentials not configured. API calls will fail until credentials are provided.');
  // Use placeholder URL to satisfy type requirements
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

// ============================================
// Database Types (generated from schema)
// ============================================

export interface DbCave {
  id: number;
  cave_id: number;
  cave_name: string | null;
  subcave_name: string;
  cave_religion: string | null;
  cave_location: string | null;
  cave_dates: string | null;
  cave_description: string | null;
  cave_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlan {
  id: number;
  plan_id: number;
  cave_id: number;
  plan_floor: number;
  plan_image: string | null;
  plan_width: number | null;
  plan_height: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbImage {
  id: number;
  image_id: number;
  master_id: number | null;
  cave_id: number;
  plan_id: number | null;
  medium: string;
  subject: string;
  motifs: string;
  description: string;
  file_path: string;
  image_date: string;
  notes: string;
  rank: number;
  rotate: number;
  thumbnail: string | null;
  plan_x_px: number | null;
  plan_y_px: number | null;
  plan_x_norm: number | null;
  plan_y_norm: number | null;
  photographer: string | null;
  default_priority: number;
  assignment_questionable: boolean;
  assignment_notes: string | null;
  coordinates_questionable: boolean;
  cloudflare_image_id: string | null;
  cloudflare_thumbnail_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Query Functions
// ============================================

/**
 * Fetch all caves with image and floor counts
 */
export async function getCaves(tradition?: string) {
  let query = supabase
    .from('caves')
    .select(`
      *,
      plans:plans(count),
      images:images(count)
    `)
    .order('cave_id');

  if (tradition) {
    query = query.eq('cave_religion', tradition);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching caves:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single cave with its plans
 */
export async function getCave(caveId: number) {
  const { data, error } = await supabase
    .from('caves')
    .select(`
      *,
      plans:plans(*)
    `)
    .eq('cave_id', caveId)
    .single();

  if (error) {
    console.error('Error fetching cave:', error);
    throw error;
  }

  return data;
}

/**
 * Fetch all cave IDs (for static generation)
 */
export async function getAllCaveIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from('caves')
    .select('cave_id')
    .order('cave_id');

  if (error) {
    console.error('Error fetching cave IDs:', error);
    throw error;
  }

  return data?.map(c => c.cave_id) || [];
}

/**
 * Fetch images for a cave floor
 */
export async function getCaveFloorImages(caveId: number, floorNumber: number) {
  // First get the plan_id for this floor
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('plan_id')
    .eq('cave_id', caveId)
    .eq('plan_floor', floorNumber)
    .single();

  if (planError || !plan) {
    return [];
  }

  // Then get images for this plan
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('plan_id', plan.plan_id)
    .eq('rank', 1)
    .order('file_path');

  if (error) {
    console.error('Error fetching images:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single image detail
 */
export async function getImage(imageId: number) {
  const { data, error } = await supabase
    .from('images')
    .select(`
      *,
      caves:caves(cave_name, cave_religion),
      plans:plans(plan_floor)
    `)
    .eq('image_id', imageId)
    .single();

  if (error) {
    console.error('Error fetching image:', error);
    throw error;
  }

  return data;
}

/**
 * Search images using full-text search
 */
export async function searchImages(query: string, caveId?: number, page: number = 1, pageSize: number = 20) {
  let dbQuery = supabase
    .from('images')
    .select('*', { count: 'exact' })
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english'
    })
    .eq('rank', 1)
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (caveId) {
    dbQuery = dbQuery.eq('cave_id', caveId);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error('Error searching images:', error);
    throw error;
  }

  return {
    results: data || [],
    total: count || 0,
    page,
    pageSize,
    query
  };
}

