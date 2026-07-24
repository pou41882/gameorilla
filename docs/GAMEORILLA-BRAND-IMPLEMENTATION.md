# Gameorilla brand implementation

## Source of truth

The five supplied JPEG pages in `public/brand/reference/` are the canonical
source kit. The site implements those guidelines as reusable code rather than
using each page as a full-screen background.

## Fixed brand equity

- Pixel-first visual language
- Midnight black base with cyan, aqua, pink, purple, coral, and pixel-white
  accents
- Stepped color bands instead of smooth, glossy gradients
- Black backgrounds with neon edge glow
- City, nightlife, palms, skyline, and water as environmental language
- Super-chill ape energy; never aggressive
- Controller-eye glasses remain the signature mascot device
- Clear hierarchy aligned to a visible pixel grid

## Palette

| Token | Hex |
| --- | --- |
| Midnight Black | `#04050A` |
| Vice Cyan | `#27E7E2` |
| Arcade Aqua | `#5BFFF3` |
| Miami Pink | `#FF3EA8` |
| Electric Purple | `#8D46FF` |
| Sunset Violet | `#5130C9` |
| Neon Coral | `#FF5E78` |
| Pixel White | `#F3F6FF` |
| Concrete Gray | `#8A8EA3` |

The values are defined as CSS custom properties in `app/globals.css` and as
structured data in `lib/gameorilla-brand.ts`.

## Type

The kit calls for Press Start 2P, Pixeloid Sans, and VT323. The scaffold uses
strict pixel/monospace system fallbacks so it builds without remote font
downloads. Before public launch, add properly licensed local webfont files for
the three canonical typefaces and preserve the current display/UI/utility role
split.

## Image treatment

- Supplied brand pages are kept unaltered in `public/brand/reference/`.
- `image-rendering: pixelated` protects their pixel-first appearance when
  scaled.
- The homepage crops the supplied icon-system page inside a neon mascot frame.
- Do not replace the canonical mascot with photorealistic, smooth vector, or
  childlike art.

## Audio identity

Future games should follow the supplied audio system:

- UI navigation: 80–200 ms, 1–3 notes, clean attack
- Success/reward: 300–900 ms, major intervals, rising contour
- Warning/error: 120–400 ms, minor second or tritone, downward contour
- Theme music: 30–90 second loops, 100–140 BPM, hook in the first eight bars
- Sonic DNA: 8-bit + 16-bit, FM synth leads, PSG pulse/square voices, triangle
  or sub-bass support, and noise-channel percussion

## Accessibility

- Semantic page landmarks and heading order
- Skip link and visible keyboard focus
- Text alternatives for informative brand art
- Reduced-motion support
- High-contrast copy and controls
- No information communicated by color alone

## Do not

- Introduce beige paper or earthy palettes
- Smooth the artwork into modern anti-aliased vector illustration
- Use photorealistic apes
- Add childlike toy energy
- Introduce generic sans-serif product styling inside the arcade UI
- Distort or redraw the controller-eye glasses
