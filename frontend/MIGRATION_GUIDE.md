# Migration Guide: Unified Explorer Interface

This guide explains how to migrate from the old multi-page structure to the new unified explorer interface.

## Overview

The new `/explore` page combines:
- Cave map with clickable numbers
- Floor plan selection
- Interactive floor plan with markers
- Image display
- Image information panel
- Thumbnail gallery

All in a single, responsive interface that works across desktop, tablet, and mobile devices.

## URL Structure

### Old URLs
- `/caves/[caveNumber]` - Cave detail page
- `/caves/[caveNumber]/floor/[floorNumber]` - Floor plan page
- `/images/[imageId]` - Individual image page

### New URLs
- `/explore?cave=[caveId]&floor=[floorNumber]&image=[imageId]` - Unified interface

### Examples
- Old: `/caves/11` → New: `/explore?cave=11&floor=1`
- Old: `/caves/11/floor/2` → New: `/explore?cave=11&floor=2`
- Old: `/images/123` → New: `/explore?cave=11&floor=1&image=123`

## Component Redirects

To maintain backward compatibility, you can add redirects in your old page components:

### 1. Update Cave Detail Page

```typescript
// app/caves/[caveNumber]/page.tsx
import { redirect } from 'next/navigation';

export default async function CavePage({ params }: { params: { caveNumber: string } }) {
  redirect(`/explore?cave=${params.caveNumber}&floor=1`);
}
```

### 2. Update Floor Page

```typescript
// app/caves/[caveNumber]/floor/[floorNumber]/page.tsx
import { redirect } from 'next/navigation';

export default async function FloorPage({
  params,
}: {
  params: { caveNumber: string; floorNumber: string };
}) {
  redirect(`/explore?cave=${params.caveNumber}&floor=${params.floorNumber}`);
}
```

### 3. Update Image Page

```typescript
// app/images/[imageId]/page.tsx
import { redirect } from 'next/navigation';

export default async function ImagePage({ params }: { params: { imageId: string } }) {
  // Fetch image to get cave and floor info
  const image = await fetchImageDetail(params.imageId);
  if (image) {
    redirect(`/explore?cave=${image.cave_id}&floor=${image.floor_number || 1}&image=${image.id}`);
  }
  notFound();
}
```

## Navigation Updates

### Update Header/Navigation Links

```typescript
// Replace old cave links
<Link href={`/caves/${caveId}`}>
// With new explore links
<Link href={`/explore?cave=${caveId}&floor=1`}>

// Replace floor links
<Link href={`/caves/${caveId}/floor/${floorNumber}`}>
// With new explore links
<Link href={`/explore?cave=${caveId}&floor=${floorNumber}`}>

// Replace image links
<Link href={`/images/${imageId}`}>
// With new explore links
<Link href={`/explore?cave=${caveId}&floor=${floorNumber}&image=${imageId}`}>
```

### Update Home Page

```typescript
// app/page.tsx
// Replace cave grid links to point to /explore
<Link href={`/explore?cave=${cave.cave_number}&floor=1`}>
  {cave.name}
</Link>
```

## Responsive Behavior

### Desktop (≥1024px)
- Full 4-column layout
- Cave map header (sticky)
- Mini floor plans sidebar
- Interactive floor plan
- Main image display
- Info panel sidebar
- Thumbnail gallery at bottom

### Tablet (768px - 1023px)
- 2-column layout
- Floor selector tabs
- Floor plan + Image side-by-side
- Collapsible info panel
- Thumbnail gallery

### Mobile (<768px)
- Vertical stack
- Cave dropdown selector
- Horizontal scrolling floor tabs
- Full-width image
- Collapsible details
- Collapsible floor plan
- 2-column thumbnail grid

## SEO and Metadata

The new page handles metadata dynamically based on URL parameters:

```typescript
export async function generateMetadata({ searchParams }: { searchParams: any }) {
  const caveId = searchParams.cave;
  const imageId = searchParams.image;
  
  if (imageId) {
    const image = await fetchImage(imageId);
    return {
      title: `${image.subject} - Ellora Caves Explorer`,
      description: image.description,
    };
  }
  
  const cave = await fetchCave(caveId);
  return {
    title: `${cave.name} - Ellora Caves Explorer`,
    description: `Explore ${cave.name} with interactive floor plans and detailed imagery`,
  };
}
```

## Maintaining Old Routes (Optional)

If you want to keep old routes functional alongside the new interface:

1. Keep the old page components
2. Add a toggle or link to switch between views
3. Use the redirect approach shown above to prefer the new interface

## Testing Checklist

- [ ] Cave map loads with gradient background
- [ ] Cave numbers are clickable and properly positioned
- [ ] Selected cave is highlighted
- [ ] Floor plans display correctly
- [ ] Interactive markers appear on floor plans
- [ ] Clicking markers updates the main image
- [ ] Image info panel shows all metadata
- [ ] Thumbnail gallery scrolls horizontally
- [ ] Clicking thumbnails updates selection
- [ ] URL updates when changing cave/floor/image
- [ ] Deep linking works (direct URL access)
- [ ] Responsive layouts work on mobile/tablet/desktop
- [ ] Browser back/forward buttons work correctly

## Performance Optimization

The new interface includes:
- Lazy loading of floor plan images
- Thumbnail images for gallery
- Preloading of adjacent images
- Efficient state management
- Minimal re-renders

## Future Enhancements

Planned improvements:
- Keyboard navigation (arrow keys to navigate images)
- Swipe gestures on mobile
- Fullscreen image view
- Image comparison mode
- Favorites/bookmarks
- Share functionality
- Print view

