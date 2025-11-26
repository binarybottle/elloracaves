# Quick Start Guide: Unified Explorer

## 🚀 Get Started in 3 Steps

### 1. Start the Development Server

```bash
cd /Users/arno/elloracaves/frontend
npm run dev
```

### 2. Open the Explorer

Visit: **http://localhost:3000/explore?cave=10&floor=1**

### 3. Explore!

- Click cave numbers on the map to switch caves
- Click floor numbers on the left to change floors
- Click markers on the floor plan to view images
- Click thumbnails at the bottom to navigate

## 🎯 What You'll See

### Header
- Site title and navigation
- Link to Explorer, Search, etc.

### Cave Map (Top)
- Black background with gradient overlay
- Cave numbers positioned along the contour
- Click any number to explore that cave
- Selected cave is highlighted in green

### Main Interface (4 Columns on Desktop)

**Column 1: Floor Plans** (left)
- Mini thumbnails of each floor
- Click to switch floors
- Only visible if cave has multiple floors

**Column 2: Interactive Floor Plan**
- Full floor plan image
- Small dots show image locations
- Hover to see image subject
- Click to select that image

**Column 3: Main Image**
- Large, high-quality image display
- Subject and description below
- Image ID and filename at bottom

**Column 4: Information Panel** (right)
- Complete metadata
- Motifs as styled tags
- Location details
- Photographer info
- File information

**Bottom: Thumbnail Gallery**
- All images from current floor
- Scroll horizontally
- Selected image has green border
- Click any thumbnail to view

## 📱 Try Different Screen Sizes

### Desktop View (Open Dev Tools: Cmd+Opt+I)
1. Click the device toolbar icon (Cmd+Shift+M)
2. Try "Responsive" mode
3. Drag to resize

### Tablet View
- Set width to 768px
- See 2-column layout
- Floor tabs instead of sidebar

### Mobile View
- Set width to 375px
- Vertical stacking
- Collapsible sections
- Swipe-friendly controls

## 🔗 Test Different URLs

### Caves to Try

**Buddhist Caves:**
```
http://localhost:3000/explore?cave=10&floor=1  # Cave 10 (Vishvakarma)
http://localhost:3000/explore?cave=5&floor=1   # Cave 5
http://localhost:3000/explore?cave=12&floor=1  # Cave 12 (Teen Tal)
```

**Hindu Caves:**
```
http://localhost:3000/explore?cave=16&floor=1  # Cave 16 (Kailasa Temple) ⭐
http://localhost:3000/explore?cave=16&floor=2  # Kailasa - Floor 2
http://localhost:3000/explore?cave=29&floor=1  # Cave 29 (Dhumar Lena)
```

**Jain Caves:**
```
http://localhost:3000/explore?cave=32&floor=1  # Cave 32 (Indra Sabha) ⭐
http://localhost:3000/explore?cave=32&floor=2  # Indra Sabha - Floor 2
http://localhost:3000/explore?cave=33&floor=1  # Cave 33
```

### With Specific Images

Add `&image=[imageId]` to jump to a specific image:
```
http://localhost:3000/explore?cave=16&floor=1&image=123
```

## ✅ Verification Checklist

### Visual Check
- [ ] Cave map displays with gradient background
- [ ] Cave numbers are clickable and positioned correctly
- [ ] Selected cave number is highlighted in green
- [ ] Floor plans show on the left (if multiple floors)
- [ ] Floor plan displays with image markers
- [ ] Main image loads and displays properly
- [ ] Info panel shows all metadata
- [ ] Thumbnail gallery displays at bottom
- [ ] Selected thumbnail has green border

### Interaction Check
- [ ] Clicking cave numbers changes the cave
- [ ] Clicking floor plans changes the floor
- [ ] Clicking markers on floor plan changes the image
- [ ] Clicking thumbnails changes the image
- [ ] Hovering over markers shows tooltips
- [ ] URL updates when changing selection

### Responsive Check
- [ ] Desktop layout (4 columns) works
- [ ] Tablet layout (2 columns + tabs) works
- [ ] Mobile layout (vertical stack) works
- [ ] All sections are accessible on mobile
- [ ] Navigation is easy on all screen sizes

## 🐛 Troubleshooting

### Map Not Showing
- Check: `/frontend/public/images/maps/map_260x1024px_gradient.png` exists
- Size should be ~69KB
- Try: `ls -lh public/images/maps/`

### Cave Numbers Not Positioned
- Check console for errors
- Verify CaveMap component is rendering
- Check CSS aspect ratio calculation

### API Errors
- Ensure backend is running: `docker-compose up backend`
- Check API URL in environment variables
- Verify API returns data: `curl http://localhost:8000/api/v1/caves/10`

### Images Not Loading
- Check image URLs in Network tab
- Verify IMAGE_BASE_URL is correct
- Check image permissions in backend

### TypeScript Errors
- Run: `npm install`
- Restart dev server
- Check: `npm run type-check` (if available)

## 🎨 Customization

### Change Colors
Edit the color values in components:
- Background: `bg-black`
- Text: `text-[#eae2c4]`
- Links: `text-[#487a14]` hover `text-[#6ebd20]`

### Adjust Layout
Modify grid columns in `app/explore/page.tsx`:
```typescript
// Current: 4-column layout
<div className="lg:grid-cols-[120px_1fr_360px_320px]">

// Wider image: increase 360px to 480px
<div className="lg:grid-cols-[120px_1fr_480px_320px]">
```

### Change Default Cave
Edit `app/explore/page.tsx`:
```typescript
const caveId = searchParams.get('cave') || '16'; // Change '10' to '16'
```

## 📚 Learn More

- **Full Documentation**: See `README_EXPLORE.md`
- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console for errors (F12)
2. Check the terminal for server errors
3. Verify all files are in place
4. Try a different cave/floor combination
5. Restart the development server

## 🎉 Next Steps

Once everything is working:
1. ✅ Explore different caves and floors
2. ✅ Test on different screen sizes
3. ✅ Try the URL-based navigation
4. ✅ Check the responsive behavior
5. ✅ Compare with original PHP site
6. 🚀 Deploy to production!

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint

# Run migration script (dry-run)
node src/scripts/update-links.js --dry-run

# Run migration script (live)
node src/scripts/update-links.js
```

Happy exploring! 🏛️✨

