# 🐰 Bunny Intel - Quick Start

## What Just Happened?

Your boring "megaSHETH Labs" got transformed into **Bunny Intel** — a playful, colorful, Looney Tunes-inspired analytics platform for MegaETH. Same functionality, way more fun.

## Preview the Changes

```bash
cd /home/kuusho/ideation-labs/megashETH-labs/mega-heatmap
npm run dev
```

Then open: `http://localhost:3000`

## Key Visual Changes

### Homepage
- **Before:** Corporate tech vibes
- **After:** Floating ASCII bunny, rainbow gradients, fun copy

### Header
- **Before:** "megaSHETH" logo
- **After:** Bunny mascot + "Bunny Intel" with carrot 🥕

### Heatmap
- **Before:** Fire-only color scheme
- **After:** 5 schemes (🌈 Rainbow, 🔥 Fire, 🥕 Carrot, 🌊 Ocean, 🌲 Forest)

### Colors
- **Before:** Orange/red/dark
- **After:** Pink, purple, blue, yellow, green rainbow palette

## What's New

1. **BunnyMascot Component**
   - Interactive ASCII art bunny
   - Multiple poses (click to cycle)
   - Animated floating effect

2. **Multicolor Heatmaps**
   - 5 fun color schemes
   - Default: Rainbow (pink→purple→blue→yellow)
   - Emoji scheme picker

3. **Playful Copy**
   - "bunny speed gud"
   - "drug-induced blocktimes"
   - "methalio"
   - Lowercase vibes

4. **Animations Everywhere**
   - Bouncing cards
   - Shimmer effects
   - Wiggle on hover
   - Spring physics

5. **New Page: /deployments**
   - Under construction placeholder
   - ASCII rocket art
   - Coming soon messaging

## File Changes

### Modified:
- `src/styles/globals.css` - Bunny color system + animations
- `tailwind.config.ts` - Bunny color palette
- `src/components/layout/Header.tsx` - Bunny branding
- `src/app/layout.tsx` - Metadata + background
- `src/app/page.tsx` - Homepage redesign
- `src/app/heatmap/page.tsx` - Color scheme updates
- `src/components/heatmap/Heatmap.tsx` - Multicolor support

### Created:
- `src/components/BunnyMascot.tsx` - ASCII bunny component
- `src/app/deployments/page.tsx` - Placeholder page
- `BUNNY_INTEL_REDESIGN.md` - Full documentation
- `BUNNY_QUICK_START.md` - This file

## Customization

### Adjust Colors
Edit `tailwind.config.ts`:
```typescript
bunny: {
  pink: { DEFAULT: "#ff85d4" }, // Change this
  // ... etc
}
```

### Change Default Heatmap Scheme
Edit `src/app/heatmap/page.tsx`:
```typescript
const [colorScheme, setColorScheme] = useState<...>("rainbow"); // rainbow | fire | carrot | ocean | forest
```

### Tweak Animations
Edit `src/styles/globals.css`:
```css
@keyframes bunny-hop {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.1); } // Adjust bounce height
}
```

### Mascot Behavior
Edit `src/components/BunnyMascot.tsx`:
- Change poses
- Adjust animation speed
- Modify interactive behavior

## Reverting Changes

If you want to go back to the old design:

```bash
cd /home/kuusho/ideation-labs/megashETH-labs/mega-heatmap
git status # See all changed files
git diff src/app/page.tsx # Review specific changes
git checkout src/app/page.tsx # Revert specific file
git reset --hard HEAD # Revert everything (⚠️ destructive)
```

## Next Steps

1. **Test it:**
   ```bash
   npm run dev
   ```

2. **Tweak it:**
   - Colors too bright? Dial them down
   - Animations too much? Remove some
   - Copy too casual? Make it professional

3. **Deploy it:**
   ```bash
   npm run build
   npm start
   # or
   vercel deploy
   ```

## Common Issues

### Build Errors
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

### Type Errors
```bash
# Check types without building
npx tsc --noEmit
```

### Styling Issues
```bash
# Rebuild Tailwind
npm run dev
# Then hard refresh browser (Ctrl+Shift+R)
```

## Feedback

Love it? Hate it? Want changes?

Edit this file, commit your changes, or just tell Pan what needs adjustment.

---

**bunny intel • onchain quant • megaeth**

*built with 🥕 by pan*
