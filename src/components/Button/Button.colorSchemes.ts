// Defined button color patterns -- add more here as new CTA treatments show
// up in the designs (e.g. a dark-green filled variant seen elsewhere on the
// site but not yet built). Keeping this as a closed set (not free hex input)
// is what lets every button share consistent hover/active behavior.
export const BUTTON_COLOR_SCHEMES = {
  white: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    // Real hover is a faint grey shift, not the theme's default blue hover.
    hoverBackgroundColor: '#f1f2f3', // --fs-color-neutral-1
  },
} as const

export type ButtonColorScheme = keyof typeof BUTTON_COLOR_SCHEMES
