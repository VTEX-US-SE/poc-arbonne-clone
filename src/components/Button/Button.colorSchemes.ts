export const BUTTON_COLOR_SCHEMES = {
  white: {
    backgroundColor: 'var(--arb-color-white)',
    textColor: 'var(--arb-color-text)',
    padding: '0.25rem 3.75rem',
    fontFamily: 'var(--arb-font-body)',
    letterSpacing: '0.125rem',
    height: '2.025rem',
  },
  green: {
    backgroundColor: 'var(--arb-color-green-dark)',
    textColor: 'var(--arb-color-white)',
    padding: '0.25rem 3.75rem',
    fontFamily: 'var(--arb-font-body)',
    letterSpacing: '0.125rem',
    height: '2.25rem',
  },
  borderless: {
    backgroundColor: 'transparent',
    textColor: 'var(--arb-color-text)',
    padding: '0',
    fontFamily: 'var(--arb-font-body)',
    letterSpacing: '0.125rem',
    height: 'auto',
  },
  whiteOutline: {
    backgroundColor: 'var(--arb-color-white)',
    textColor: 'var(--arb-color-text)',
    borderColor: 'var(--arb-color-text)',
    borderWidth: '1px',
    hoverBackgroundColor: 'var(--arb-color-text)',
    hoverTextColor: 'var(--arb-color-white)',
    padding: '0.5rem 3rem',
    fontFamily: 'var(--arb-font-heading)',
    letterSpacing: '1.06px',
    height: '2.5rem',
  },
} as const

export type ButtonColorScheme = keyof typeof BUTTON_COLOR_SCHEMES
