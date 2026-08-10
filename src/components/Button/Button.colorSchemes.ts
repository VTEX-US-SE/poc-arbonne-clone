// Defined button visual patterns -- add more here as new CTA treatments show
// up in the designs. Keeping this as a closed set (not free hex input) is
// what lets every button share consistent hover/active behavior. Padding,
// font, and letter-spacing genuinely differ per style (verified via prod
// devtools inspection) -- don't assume they're universal across schemes.
export const BUTTON_COLOR_SCHEMES = {
  white: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    // Real hover is a faint grey shift, not the theme's default blue hover.
    hoverBackgroundColor: '#f1f2f3', // --fs-color-neutral-1
    padding: '0.25rem 3.75rem', // 4px 60px, verified via prod inspector
    fontFamily: "'Nunito Sans', sans-serif",
    letterSpacing: '0.125rem', // 2px
    // The library forces line-height to exactly equal font-size (zero
    // leading), so height can't be derived from padding + line-height like
    // a normal element -- set explicitly to the measured value instead.
    height: '2.025rem', // 32.4px, verified via prod inspector
  },
  whiteOutline: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    borderColor: '#252525',
    borderWidth: '1px',
    // Fills solid dark charcoal on hover, text flips to white. Verified via
    // prod devtools: .btn-arbonne-secondary-outlined:hover { background:
    // #252525; border-color: #252525; color: #fff }
    hoverBackgroundColor: '#252525',
    hoverTextColor: '#ffffff',
    padding: '0.5rem 3rem', // 8px 48px, verified via prod inspector
    fontFamily: "'Nunito', sans-serif", // "Nunito Extrabold" per prod inspector
    letterSpacing: '1.06px', // verified via Figma capture data
    height: '2.5rem', // 40px, verified via prod inspector (181.56 x 40)
  },
} as const

export type ButtonColorScheme = keyof typeof BUTTON_COLOR_SCHEMES
