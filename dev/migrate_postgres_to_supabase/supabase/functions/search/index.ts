/**
 * Supabase Edge Function for Image Search
 * 
 * Provides full-text search across image metadata using PostgreSQL's
 * built-in text search capabilities.
 * 
 * Endpoint: POST /functions/v1/search
 * 
 * Request body:
 * {
 *   "query": "search terms",
 *   "cave_id": 16,        // optional: filter by cave
 *   "page": 1,            // optional: pagination (default 1)
 *   "page_size": 20       // optional: results per page (default 20, max 100)
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string
  cave_id?: number
  page?: number
  page_size?: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { query, cave_id, page = 1, page_size = 20 }: SearchRequest = await req.json()

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Limit page size
    const limitedPageSize = Math.min(page_size, 100)
    const offset = (page - 1) * limitedPageSize

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Build search query using textSearch
    let searchQuery = supabaseClient
      .from('images')
      .select('*', { count: 'exact' })
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      })
      .eq('rank', 1)  // Only primary images
      .range(offset, offset + limitedPageSize - 1)
      .order('default_priority', { ascending: false })

    // Add cave filter if specified
    if (cave_id) {
      searchQuery = searchQuery.eq('cave_id', cave_id)
    }

    const { data, error, count } = await searchQuery

    if (error) {
      console.error('Search error:', error)
      return new Response(
        JSON.stringify({ error: 'Search failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Transform results to match expected format
    const results = (data || []).map(img => ({
      image: {
        id: img.image_id,
        file_path: img.file_path,
        subject: img.subject,
        description: img.description,
        cave_id: img.cave_id,
        coordinates: img.plan_x_px ? {
          plan_x_px: img.plan_x_px,
          plan_y_px: img.plan_y_px,
          plan_x_norm: img.plan_x_norm,
          plan_y_norm: img.plan_y_norm,
        } : null,
        image_url: getImageUrl(img.cloudflare_image_id, img.file_path, 'large'),
        thumbnail_url: getThumbnailUrl(img.cloudflare_image_id, img.cloudflare_thumbnail_id, img.file_path, img.thumbnail),
      }
    }))

    return new Response(
      JSON.stringify({
        results,
        total: count || 0,
        page,
        page_size: limitedPageSize,
        query,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Request error:', err)
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper functions for image URLs
const CF_ACCOUNT_HASH = Deno.env.get('CF_IMAGES_ACCOUNT') || ''

function getImageUrl(cloudflareId: string | null, localPath: string, variant: string = 'large'): string {
  if (cloudflareId && CF_ACCOUNT_HASH) {
    return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${cloudflareId}/${variant}`
  }
  // Fallback to local path (for development)
  return `/images/caves_1200px/${localPath}`
}

function getThumbnailUrl(
  cloudflareId: string | null,
  cloudflareThumbId: string | null,
  localPath: string,
  localThumbPath: string | null
): string {
  // Prefer dedicated thumbnail Cloudflare ID
  if (cloudflareThumbId && CF_ACCOUNT_HASH) {
    return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${cloudflareThumbId}/thumb`
  }
  // Fall back to main image thumbnail variant
  if (cloudflareId && CF_ACCOUNT_HASH) {
    return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${cloudflareId}/thumb`
  }
  // Fall back to local thumbnail
  return `/images/caves_thumbs/${localThumbPath || localPath}`
}

