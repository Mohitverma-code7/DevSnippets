---
name: DevSnippets AI Light
colors:
  surface: '#fff8f7'
  surface-dim: '#ffced3'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f1'
  surface-container: '#ffe9ea'
  surface-container-high: '#ffe1e3'
  surface-container-highest: '#ffd9dd'
  on-surface: '#400012'
  on-surface-variant: '#5c3f40'
  inverse-surface: '#5e1425'
  inverse-on-surface: '#ffeced'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#b80035'
  on-primary: '#ffffff'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb3b6'
  secondary: '#635c61'
  on-secondary: '#ffffff'
  secondary-container: '#e7dde3'
  on-secondary-container: '#686066'
  tertiary: '#a42f46'
  on-tertiary: '#ffffff'
  tertiary-container: '#c5485d'
  on-tertiary-container: '#fffaf9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#eae0e6'
  secondary-fixed-dim: '#cec4ca'
  on-secondary-fixed: '#1f1a1e'
  on-secondary-fixed-variant: '#4b454a'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#fff8f7'
  on-background: '#400012'
  surface-variant: '#ffd9dd'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 22px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for a high-performance developer environment that balances technical precision with a refreshing, modern aesthetic. The brand personality is efficient, sophisticated, and vibrant, moving away from traditional "dark mode" developer tropes toward a high-clarity light interface.

The style leverages **Minimalism** with subtle **Glassmorphism** to maintain a sense of lightness and depth. It avoids "cuteness" by utilizing rigid structural grids, generous whitespace, and sharp technical typography. The emotional response should be one of "energized focus"—providing a workspace that feels clean, professional, and distinctively modern.

## Colors

The palette centers on a "Vibrant Rose" spectrum, optimized for professional utility. 

- **Primary (#e11d48):** Used for critical actions, active states, and key brand moments. It provides the necessary visual weight against the soft background.
- **Secondary (#fdf2f8):** The base tint for large surface areas to reduce eye strain compared to pure white.
- **Surface & Container:** We utilize `#fff1f2` for the main canvas and `#ffe4e6` for inset elements like sidebars or code-block headers.
- **Neutral/Text:** High-contrast deep rose-tinted blacks (#4c0519) are used for body text to ensure AAA accessibility while maintaining the palette's warmth.
- **Syntax Highlighting:** Use a specialized light-theme variant with deep teals, burnt oranges, and the primary rose to ensure code logic is instantly scannable.

## Typography

The typography system relies on **Geist** for all UI elements to provide a clean, neo-grotesque feel that developers find familiar and readable. 

- **JetBrains Mono** is introduced specifically for code snippets and technical labels to provide clear character differentiation (l vs 1, O vs 0).
- **Headlines** use tighter letter-spacing and heavier weights to provide structural anchors on the page.
- **Body text** maintains a generous line-height to ensure long-form documentation or AI explanations remain legible during extended reading sessions.

## Layout & Spacing

This design system uses a **Fixed Grid** model for desktop to maintain optimal line lengths for code readability, transitioning to a **Fluid Grid** for mobile devices.

- **Grid:** 12-column system on desktop, 4-column on mobile.
- **Rhythm:** An 8px base unit governs all dimensions.
- **Code Blocks:** Should always span the full width of their container with internal padding of `1.5rem` (24px) to allow the code "room to breathe."
- **Breakpoints:** Mobile (<640px), Tablet (640px-1024px), Desktop (>1024px). On mobile, sidebars collapse into a bottom-sheet or full-screen overlay to maximize workspace.

## Elevation & Depth

Depth is established through **Tonal Layering** and **Soft Ambient Shadows**. 

- **Level 0 (Surface):** The base `#fff1f2` background.
- **Level 1 (Cards/Containers):** `#ffe4e6` with a 1px solid border of `#fecdd3` (a slightly darker pink) instead of heavy shadows.
- **Level 2 (Popovers/Modals):** Floating elements use a very soft, diffused shadow (`0px 10px 30px rgba(225, 29, 72, 0.08)`) and a backdrop blur of 12px to create a glass-like separation from the code editor beneath.
- **Focus States:** High-visibility 2px outer glow using the primary color at 30% opacity.

## Shapes

The shape language is defined by **Medium Roundedness** (0.5rem base), which creates a modern, "app-like" feel without appearing juvenile.

- **Small Components:** Checkboxes and small tags use `rounded-sm` (0.25rem).
- **Standard Components:** Buttons, input fields, and cards use the default 0.5rem.
- **Large Components:** Hero sections or main code containers use `rounded-xl` (1.5rem) to softly frame the technical content.

## Components

- **Buttons:** Primary buttons are solid `#e11d48` with white text. Secondary buttons use a "ghost" style with a `#fb7185` border and text.
- **Input Fields:** Soft pink backgrounds (`#fff1f2`) with a subtle 1px border. On focus, the border transitions to Primary Red.
- **Code Blocks:** The defining component. Use a slightly darker background than the surface (`#ffe4e6`) with a "Copy" button appearing in the top right on hover. Syntax colors must pass a 4.5:1 contrast ratio against the light pink background.
- **Chips/Badges:** Small, pill-shaped tags used for language indicators (e.g., "Python", "React"). These use a semi-transparent version of the primary color with deep red text.
- **Lists:** Clean, borderless list items with a subtle background hover state (`#fce7f3`).
- **AI Response Cards:** Distinguished by a very thin gradient border (Primary Red to Secondary Pink) to signify AI-generated content versus static code.