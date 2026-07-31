# DIY Shop Design Direction

DIY Shop uses a warm, confident retail language inspired by the colour discipline, rounded geometry, and calm materiality of a contemporary coffeehouse. It is an inspiration, not a Starbucks clone: do not use Starbucks logos, names, copy, proprietary fonts, Rewards concepts, or drink-specific patterns.

## Priorities

1. Customer clarity, accessibility, and real product information come first.
2. The storefront must support Vietnamese and English without changing its visual hierarchy.
3. The seller dashboard will reuse the core tokens, but may use denser operational layouts.
4. Product requirements and accessibility override this document when they conflict.

## Core Tokens

```css
:root {
  --color-brand: #006241;
  --color-action: #00754a;
  --color-forest: #1e3932;
  --color-forest-soft: #2b5148;
  --color-mint: #d4e9e2;
  --color-canvas: #f2f0eb;
  --color-ceramic: #edebe9;
  --color-surface: #ffffff;
  --color-text: rgba(0, 0, 0, 0.87);
  --color-text-muted: rgba(0, 0, 0, 0.58);
  --color-danger: #c82014;
  --color-gold: #cba258;
  --radius-card: 12px;
  --radius-control: 50px;
  --shadow-card: 0 0 0.5px rgba(0, 0, 0, 0.14), 0 1px 1px rgba(0, 0, 0, 0.24);
  --shadow-navigation: 0 1px 3px rgba(0, 0, 0, 0.1), 0 2px 2px rgba(0, 0, 0, 0.06), 0 0 2px rgba(0, 0, 0, 0.07);
}
```

Gold is reserved for exceptional or ceremonial moments. It is not a general purpose accent.

## Typography

Use `Manrope`, `Helvetica Neue`, Helvetica, Arial, sans-serif. Manrope is an open substitute for the unavailable reference font and must be self-hosted before it becomes the production font. Use tight but readable tracking around `-0.01em`, a compact `1.2` line height for headings, and `1.5` for body copy.

Typography creates hierarchy through weight, colour, and spacing before raw scale. Body text is never pure black on light surfaces.

## Components and Interaction

- Buttons are full pills. Primary actions use `--color-action` with white text.
- Buttons provide a short transition and `scale(0.95)` active feedback. Respect reduced-motion preferences.
- Cards use white surfaces, `12px` corners, and the quiet layered card shadow.
- Inputs have visible labels, strong focus rings, and no placeholder-only labels.
- Use a warm canvas with generous whitespace. Prefer grouping through space over frequent dividers.
- The catalog uses product photography from the API. Do not invent image-heavy decorative sections or fake product screenshots.

## Page Rhythm

Use warm canvas, ceramic utility surfaces, white content surfaces, and deep forest feature zones with purpose. Do not introduce gradients as structural decoration. At small screens, layouts collapse to a single column with at least 16px outer gutters.

## Theme and Accessibility

The first storefront release is intentionally light-only, even when the operating system prefers dark mode. Dark mode is deferred until it can be designed and reviewed as a complete theme. Interactive controls need visible focus states and appropriate mobile touch targets. Reduced-motion users receive instant state changes rather than animated feedback.

## Deliberate Exclusions

- No Starbucks branding or proprietary fonts.
- No Starbucks Rewards, drink sizing, nutrition, store-selection, or gift-card patterns unless DIY Shop gains an equivalent product need.
- No generic AI gradients, glassmorphism, heavy shadows, or decorative motion.
- No gold except for a specifically defined future premium or ceremonial feature.
