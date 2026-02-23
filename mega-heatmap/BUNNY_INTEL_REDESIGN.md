# 🐰 BUNNY INTEL REDESIGN

## Overview
Complete UI/UX transformation from "megaSHETH Labs" to "Bunny Intel" with Looney Tunes-inspired aesthetic meets onchain quant precision.

## Design Philosophy
- **Vibe:** chaotic good, higher-coded, wired
- **Aesthetic:** bugs bunny energy + rainbow maximalism + professional analytics
- **Tone:** playful but competent, fun but functional

## Key Changes

### 1. Brand Identity
- **Name:** megaSHETH Labs → **Bunny Intel**
- **Tagline:** "onchain quant 🐰 megaeth"
- **Mascot:** ASCII bunny character with multiple poses (default, wink, excited, carrot)
- **Colors:** Fire theme → Rainbow + Carrot + Multicolor palettes

### 2. Color Palette
New bunny brand colors:
- **Bunny Pink:** `#ff85d4` (primary accent)
- **Bunny Blue:** `#4ecdc4` (secondary)
- **Bunny Purple:** `#a770ff` (tertiary)
- **Bunny Yellow:** `#ffe66d` (highlights)
- **Bunny Green:** `#06ffa5` (megaeth native)
- **Carrot Orange:** `#ff6b35` (CTA/emphasis)

### 3. Heatmap Schemes
Added 5 colorful schemes (default: rainbow):
1. **Rainbow** 🌈 - Pink → Purple → Blue → Yellow
2. **Fire** 🔥 - Original orange/red theme
3. **Carrot** 🥕 - Orange gradient
4. **Ocean** 🌊 - Blue gradient
5. **Forest** 🌲 - Green gradient

### 4. Components Added

#### BunnyMascot.tsx
- Interactive ASCII bunny with animations
- Multiple poses (default, wink, excited, carrot)
- Hover and click interactions
- BunnyLoader for loading states
- MiniBunny for inline use
- GlowCarrot animated emoji

### 5. Updated Files

#### globals.css
- New color system with bunny palette
- Multicolor heatmap cell definitions
- Bunny-themed card styles with gradient borders
- Rainbow gradient buttons
- Fun animations (bunny-hop, shimmer, bounce-in, wiggle)
- ASCII art styling classes
- Glow effects (bunny, rainbow)

#### tailwind.config.ts
- Extended color palette with bunny colors
- Carrot color scale
- Updated gradient utilities

#### Header.tsx
- Bunny mascot in logo
- "Bunny Intel" branding
- Rainbow gradient top border
- Updated navigation with emojis
- Animated interactions
- Deployments link added

#### page.tsx (Homepage)
- Floating ASCII bunny hero
- Rainbow gradient headings
- Fun copy ("bunny speed gud", "methalio")
- Updated CTAs
- Features grid with playful descriptions
- Fun CTA section with rotating bunny

#### layout.tsx
- Updated metadata (title, description, OG)
- Dots background pattern
- Rainbow gradient orbs
- Author attribution to Pan

#### heatmap/page.tsx
- Updated color scheme picker with emojis
- Default scheme set to rainbow
- More playful UI labels

#### Heatmap.tsx
- Support for 5 color schemes
- Rainbow as default
- Enhanced hover states

### 6. New Pages

#### deployments/page.tsx
- Under construction placeholder
- ASCII rocket art
- Coming soon messaging
- Feature preview grid
- Links to @korewapandesu

### 7. Typography & Text Styles
- Text gradient utilities:
  - `.text-gradient-rainbow` - Full rainbow
  - `.text-gradient-bunny` - Pink to purple
  - `.text-gradient-carrot` - Orange to yellow
- Fun, casual copy throughout
- Lowercase for vibes, proper case for clarity

### 8. Animations
New CSS animations:
- `bunny-hop` - Bouncy hover effect
- `shimmer` - Rainbow shimmer on gradients
- `bounce-in` - Playful entrance
- `wiggle` - Subtle rotation shake

Framer motion enhancements:
- Floating elements
- Scale on hover
- Staggered reveals
- Spring physics

### 9. Interactive Elements
- Cards bounce up on hover
- Buttons have shadow depth
- Nav links underline with gradient
- Bunny mascot changes pose on click
- Color scheme pills highlight active state
- Emoji reactions on hover

### 10. Removed/Updated
- "Catalogue" link removed from nav
- Replaced with "Deployments" (placeholder)
- All "megaSHETH" references → "Bunny Intel"
- Fire-only theme → Multi-palette system

## Technical Details

### Component Structure
```
src/
├── components/
│   ├── BunnyMascot.tsx (NEW)
│   ├── layout/
│   │   └── Header.tsx (UPDATED)
│   └── heatmap/
│       └── Heatmap.tsx (UPDATED)
├── app/
│   ├── layout.tsx (UPDATED)
│   ├── page.tsx (UPDATED)
│   ├── deployments/
│   │   └── page.tsx (NEW)
│   └── heatmap/
│       └── page.tsx (UPDATED)
└── styles/
    └── globals.css (UPDATED)
```

### Color Scheme System
Each heatmap scheme has 5 levels (0-4):
- Level 0: Empty (dark gray)
- Levels 1-4: Progressive color intensity

Schemes defined in:
1. CSS (`globals.css`) - Style definitions
2. Tailwind (`tailwind.config.ts`) - Color palette
3. Component (`Heatmap.tsx`) - Scheme logic

## Design Inspirations
Per human request:
- **awwwards.com** - Modern web design excellence
- **ogimage.gallery** - Visual impact and clarity
- **Looney Tunes** - Playful, chaotic energy
- **Bugs Bunny** - Clever, confident character

## Brand Voice Examples

### Before (megaSHETH):
> "Building tools for the MegaETH ecosystem. Transaction Heatmap, Ecosystem Catalogue, and more."

### After (Bunny Intel):
> "onchain intel for the real-time blockchain. track activity, discover alpha, compete on leaderboards. bunny speed gud. 🐰🥕"

## Next Steps (Human)
1. Review the redesign
2. Test on localhost
3. Provide feedback on:
   - Color balance
   - Animation timing
   - Copy tone
   - Missing features
4. Deploy to production

## Notes
- All original functionality preserved
- Analytics/tracking unchanged
- API endpoints untouched
- Database schema intact
- Just pure frontend fun 🎨✨

---

**Built with 🥕 by pan • bunny intel • methalio**

*drug-induced blocktimes, sub-ms vibes*
