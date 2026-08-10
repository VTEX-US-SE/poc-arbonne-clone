// Defined button color patterns -- add more here as new CTA treatments show
// up in the designs. Keeping this as a closed set (not free hex input) is
// what lets every button share consistent hover/active behavior.
export const BUTTON_COLOR_SCHEMES = {
  white: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    // Real hover is a faint grey shift, not the theme's default blue hover.
    hoverBackgroundColor: '#f1f2f3', // --fs-color-neutral-1
  },
  whiteOutline: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    borderColor: '#252525',
    borderWidth: '1px',
    // Fills solid dark-green on hover, text flips to white. Hex confirmed
    // from an earlier Figma capture of a different section's filled
    // button (#0b4d45) -- reused here on the assumption it's the same
    // brand "dark fill" color, not independently re-verified for this button.
    hoverBackgroundColor: '#0b4d45',
    hoverTextColor: '#ffffff',
  },
} as const

export type ButtonColorScheme = keyof typeof BUTTON_COLOR_SCHEMES
