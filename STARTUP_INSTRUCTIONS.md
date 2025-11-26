# 🚀 Quick Startup Instructions

## Start the Application

### 1. Start Backend (if not running)
```bash
cd /Users/arno/elloracaves
docker-compose up backend
```

Wait for: `Uvicorn running on http://0.0.0.0:8000`

### 2. Start Frontend
```bash
cd /Users/arno/elloracaves/frontend
npm run dev
```

Wait for: `ready started server on 0.0.0.0:3000`

### 3. Open Explorer
Open browser: **http://localhost:3000/explore?cave=10&floor=1**

---

## ✅ Success Checklist

You should see:
- [ ] Black background with gradient cave map
- [ ] Clickable cave numbers positioned on contour
- [ ] "The Ellora caves" title in top left
- [ ] Floor plans on left (if cave has multiple floors)
- [ ] Interactive floor plan with markers
- [ ] Large image display in center
- [ ] Info panel on right
- [ ] Thumbnail gallery at bottom

---

## 🐛 Common Issues

### Issue: "Cannot GET /explore"
**Solution**: Make sure you installed dependencies first:
```bash
cd frontend
npm install
npm run dev
```

### Issue: Images not loading
**Solution**: Make sure backend is running:
```bash
docker-compose up backend
```

### Issue: Map not showing
**Solution**: Verify map files exist:
```bash
ls -lh frontend/public/images/maps/
# Should show:
# map_260x1024px_gradient.png (69KB)
# map_260x1024px_photo.png (358KB)
```

### Issue: Cave numbers not positioned
**Solution**: 
1. Open browser console (F12)
2. Check for errors
3. Verify CaveMap.tsx imported correctly

### Issue: API errors in console
**Solution**: Check backend is accessible:
```bash
curl http://localhost:8000/api/v1/caves/10
# Should return JSON data
```

---

## 🎯 Test URLs

Try these different caves:

**Buddhist Caves:**
```
http://localhost:3000/explore?cave=5&floor=1
http://localhost:3000/explore?cave=10&floor=1  # Cave 10 (Vishvakarma)
http://localhost:3000/explore?cave=12&floor=1  # Cave 12 (Teen Tal)
```

**Hindu Caves:**
```
http://localhost:3000/explore?cave=16&floor=1  # ⭐ Kailasa Temple
http://localhost:3000/explore?cave=16&floor=2  # Kailasa Floor 2
http://localhost:3000/explore?cave=29&floor=1  # Dhumar Lena
```

**Jain Caves:**
```
http://localhost:3000/explore?cave=32&floor=1  # ⭐ Indra Sabha
http://localhost:3000/explore?cave=32&floor=2  # Indra Sabha Floor 2
http://localhost:3000/explore?cave=33&floor=1
```

---

## 📱 Test Responsive Design

### Desktop View
- Open browser normally
- Should see 4-column layout

### Tablet View
1. Open DevTools (F12 or Cmd+Opt+I)
2. Click device toolbar (Cmd+Shift+M)
3. Select "iPad" or set width to 768px
4. Should see 2-column layout with tabs

### Mobile View
1. In DevTools device toolbar
2. Select "iPhone" or set width to 375px
3. Should see vertical stack with collapsible sections

---

## 🎨 What Makes It Work Like Original

### Visual Match
- ✅ Black background
- ✅ Beige text color (#eae2c4)
- ✅ Green links (#487a14 / #6ebd20)
- ✅ Gradient map background
- ✅ Cave numbers positioned exactly as original

### Functional Match
- ✅ All info on one page
- ✅ Interactive cave map
- ✅ Floor plan navigation
- ✅ Clickable markers on floor plans
- ✅ Image metadata display
- ✅ Thumbnail gallery

### Modern Improvements
- ✅ Responsive design (works on mobile)
- ✅ Deep linking (shareable URLs)
- ✅ Fast performance
- ✅ Type safety (TypeScript)
- ✅ Modern framework (Next.js 14)

---

## 📚 Documentation

For more details, see:
- `QUICK_START.md` - Detailed getting started guide
- `README_EXPLORE.md` - Full feature documentation
- `MIGRATION_GUIDE.md` - Updating existing links
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

## 💡 Pro Tips

1. **Bookmark**: `http://localhost:3000/explore?cave=16&floor=1` (Kailasa)
2. **Use URLs**: Change cave/floor/image in URL directly
3. **Browser nav**: Back/forward buttons work
4. **Share links**: URLs are shareable with others
5. **DevTools**: F12 to see console, network, etc.

---

## 🎉 You're All Set!

The unified explorer interface is now running. Explore the caves, test the responsive layouts, and enjoy the modern interface that preserves the original design!

For questions or issues:
1. Check browser console (F12)
2. Check terminal for errors
3. Verify backend is running
4. Try a different cave
5. Restart the dev server

Happy exploring! 🏛️✨

