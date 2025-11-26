# Unified Explorer Interface

## Overview

The new unified explorer interface (`/explore`) brings together all cave exploration features into a single, responsive page that closely matches the original PHP-based website design.

## Features

### 🗺️ **Interactive Cave Map**
- Gradient background map showing the contour of the Ellora caves site
- Clickable cave numbers positioned exactly as in the original design
- Visual highlighting of the currently selected cave
- Extra caves listed on the right side (16L, 20b, 30a, groups, etc.)

### 🏛️ **Multi-Floor Navigation**
- Sidebar with mini floor plan thumbnails (desktop)
- Tab-based floor selection (tablet/mobile)
- Visual indication of currently selected floor

### 📐 **Interactive Floor Plans**
- Full floor plan display with accurate dimensions
- Clickable markers showing image locations
- Hover tooltips showing image subjects
- Visual distinction between selected and unselected markers

### 🖼️ **Main Image Display**
- Large, high-quality image display
- Subject and description shown below image
- Smooth transitions when changing images
- Maintains aspect ratio

### ℹ️ **Information Panel**
- Complete metadata display
- Motifs as styled tags
- Location information with coordinates
- Photographer attribution
- File information

### 🎞️ **Thumbnail Gallery**
- Horizontal scrollable gallery at bottom
- All images from the current floor
- Visual indication of selected image
- Quick navigation between images

## Responsive Design

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────┐
│         Cave Map with Clickable Numbers              │
├──────┬────────────┬──────────┬──────────────────────┤
│Floor │  Floor     │  Main    │   Image Info         │
│Plans │  Plan      │  Image   │   Panel              │
│      │  (markers) │  Display │                      │
└──────┴────────────┴──────────┴──────────────────────┘
│              Thumbnail Gallery                        │
└──────────────────────────────────────────────────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────────────────────────┐
│      Cave Map (collapsible)              │
├──────────────────────────────────────────┤
│      Floor Tabs                          │
├──────────────┬──────────────────────────┤
│ Floor Plan   │   Main Image             │
├──────────────┴──────────────────────────┤
│      Image Info (expandable)             │
├──────────────────────────────────────────┤
│      Thumbnail Gallery                   │
└──────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────────────┐
│   Cave Dropdown                  │
├──────────────────────────────────┤
│   Floor Tabs (scroll)            │
├──────────────────────────────────┤
│   Main Image (full width)        │
├──────────────────────────────────┤
│   Info (collapsible)             │
├──────────────────────────────────┤
│   Floor Plan (collapsible)       │
├──────────────────────────────────┤
│   Thumbnail Gallery (2-col)      │
└──────────────────────────────────┘
```

## URL Structure

The explore page uses query parameters for deep linking:

```
/explore?cave=[caveId]&floor=[floorNumber]&image=[imageId]
```

### Examples:
- `/explore?cave=10&floor=1` - Cave 10, Floor 1, first image
- `/explore?cave=16&floor=2` - Cave 16, Floor 2
- `/explore?cave=11&floor=1&image=1234` - Specific image

### Benefits:
- ✅ Shareable URLs
- ✅ Browser back/forward navigation
- ✅ Deep linking to specific images
- ✅ SEO-friendly (with proper metadata)

## Color Scheme

Matching the original design:
- Background: `#000000` (black)
- Text: `#eae2c4` (light beige)
- Links: `#487a14` (green)
- Link hover: `#6ebd20` (bright green)
- Selected marker: `#6ebd20` (bright green)

## Components

### Core Components
- `CaveMap.tsx` - Interactive map with cave numbers
- `CaveNumberMarker.tsx` - SVG marker for selected caves
- `FloorPlanSidebar.tsx` - Vertical floor plan thumbnails
- `InteractiveFloorPlan.tsx` - Floor plan with clickable markers
- `ImageDisplay.tsx` - Main image viewer
- `ImageInfoPanel.tsx` - Metadata display
- `ImageGalleryStrip.tsx` - Bottom thumbnail gallery

### Page
- `app/explore/page.tsx` - Main unified explorer page

## State Management

The explore page manages state for:
- Currently selected cave
- Currently selected floor
- Currently selected image
- Floor images data
- Cave metadata

State is synchronized with URL parameters for:
- Deep linking
- Browser navigation
- Shareability

## Data Loading

```typescript
// Cave data
GET /api/v1/caves/[caveId]
// Returns: cave metadata, floor plans, tradition, etc.

// Floor images
GET /api/v1/caves/[caveId]/floors/[floorNumber]/images
// Returns: all images for the floor with coordinates

// Specific image
GET /api/v1/images/[imageId]
// Returns: full image metadata
```

## Performance Optimizations

1. **Lazy Loading**: Floor plans load only when selected
2. **Thumbnails**: Gallery uses thumbnail URLs for faster loading
3. **Image Preloading**: Adjacent images are preloaded
4. **Efficient Rendering**: Components only re-render when necessary
5. **Loading States**: Proper feedback during data fetching

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Semantic HTML structure
- ✅ Screen reader friendly
- ✅ Focus management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations

1. Marker images use SVG (original used PNG)
2. Some cave positions may need fine-tuning
3. Mobile map interaction could be improved
4. Keyboard shortcuts not yet implemented

## Future Enhancements

- [ ] Keyboard shortcuts (← → for navigation)
- [ ] Swipe gestures on mobile
- [ ] Fullscreen image mode
- [ ] Image comparison view
- [ ] Favorite/bookmark images
- [ ] Print-friendly view
- [ ] Zoom on floor plans
- [ ] Search within cave
- [ ] Image annotations
- [ ] Tour mode (auto-advance)

## Development

### Running Locally
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000/explore?cave=10&floor=1`

### Testing Different Caves
- Cave 10 (Buddhist): `/explore?cave=10&floor=1`
- Cave 16 (Hindu, Kailasa): `/explore?cave=16&floor=1`
- Cave 32 (Jain, Indra Sabha): `/explore?cave=32&floor=1`

### Building for Production
```bash
npm run build
npm start
```

## Migration from Old Interface

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details on:
- Updating existing links
- Adding redirects
- Maintaining backward compatibility
- SEO considerations

## Credits

Original design by Arno Klein (elloracaves.org)
Rebuilt with Next.js 14, TypeScript, and Tailwind CSS

