/**
 * Cloudflare Images URL Helper
 * 
 * Generates URLs for images stored in Cloudflare Images with various variants.
 * Supports fallback to local images during development.
 */

// Cloudflare Images account hash (get from dashboard)
const CF_ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_IMAGES_ACCOUNT || '';

// Image variants defined in Cloudflare Images dashboard
// Note: Only 'public' is available by default. Create other variants in CF dashboard.
export type ImageVariant = 'thumb' | 'medium' | 'large' | 'public';

// Variant sizes (for reference)
export const VARIANT_SIZES: Record<ImageVariant, { width: number; fit: string }> = {
  thumb: { width: 300, fit: 'cover' },
  medium: { width: 800, fit: 'contain' },
  large: { width: 1600, fit: 'contain' },
  public: { width: 0, fit: 'contain' }, // Original size
};

// Map requested variants to available ones
const VARIANT_FALLBACK: Record<ImageVariant, ImageVariant> = {
  thumb: 'thumb',
  medium: 'medium', 
  large: 'large',
  public: 'public',
};

/**
 * Get the Cloudflare Images URL for an image
 * 
 * @param cloudflareId - The Cloudflare image ID
 * @param variant - The variant to use (thumb, medium, large, public)
 * @returns The full Cloudflare Images URL
 * 
 * @example
 * getCloudflareUrl('abc123', 'thumb')
 * // => "https://imagedelivery.net/xxx/abc123/thumb"
 */
export function getCloudflareUrl(cloudflareId: string | null, variant: ImageVariant = 'large'): string | null {
  if (!cloudflareId || !CF_ACCOUNT_HASH) {
    return null;
  }
  
  // Use fallback variant if the requested one isn't configured in Cloudflare
  const actualVariant = VARIANT_FALLBACK[variant] || 'public';
  
  return `https://imagedelivery.net/${CF_ACCOUNT_HASH}/${cloudflareId}/${actualVariant}`;
}

/**
 * Get the image URL, preferring Cloudflare Images with fallback to local
 * 
 * @param cloudflareId - The Cloudflare image ID (may be null during migration)
 * @param localPath - The local file path (e.g., "c1/photo.jpg")
 * @param variant - The variant to use
 * @param baseUrl - Base URL for local images (API server)
 * @returns The best available image URL
 */
export function getImageUrl(
  cloudflareId: string | null,
  localPath: string,
  variant: ImageVariant = 'large',
  baseUrl?: string
): string {
  // Prefer Cloudflare Images if ID is available
  const cfUrl = getCloudflareUrl(cloudflareId, variant);
  if (cfUrl) {
    return cfUrl;
  }
  
  // Fallback to local images (for development or before migration)
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
  
  // Choose the right local directory based on variant
  const dir = variant === 'thumb' ? 'caves_thumbs' : 'caves_1200px';
  
  return `${apiUrl}/${dir}/${localPath}`;
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(
  cloudflareId: string | null,
  cloudflareThumbId: string | null,
  localPath: string,
  localThumbPath: string | null,
  baseUrl?: string
): string {
  // Prefer dedicated thumbnail Cloudflare ID
  if (cloudflareThumbId) {
    const cfUrl = getCloudflareUrl(cloudflareThumbId, 'thumb');
    if (cfUrl) return cfUrl;
  }
  
  // Fall back to main image thumbnail variant
  if (cloudflareId) {
    const cfUrl = getCloudflareUrl(cloudflareId, 'thumb');
    if (cfUrl) return cfUrl;
  }
  
  // Fall back to local thumbnail
  const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
  const thumbPath = localThumbPath || localPath;
  
  return `${apiUrl}/caves_thumbs/${thumbPath}`;
}

/**
 * Get plan image URL (floor plans are stored in public/plans/)
 */
export function getPlanImageUrl(planImage: string | null): string {
  // Treat blank.png as no plan (it's a placeholder in the database)
  if (!planImage || planImage === 'blank.png') {
    return '';
  }
  
  // Plans are served statically from /plans/ directory
  return `/plans/${planImage}`;
}

