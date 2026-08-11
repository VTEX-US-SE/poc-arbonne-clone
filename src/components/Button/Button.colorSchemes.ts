export const BUTTON_COLOR_SCHEMES = {
  white: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    padding: '0.25rem 3.75rem',
    fontFamily: "'Nunito Sans', sans-serif",
    letterSpacing: '0.125rem',
    height: '2.025rem',
  },
  green: {
    backgroundColor: '#0b4d45',
    textColor: '#ffffff',
    padding: '0.25rem 3.75rem',
    fontFamily: "'Nunito Sans', sans-serif",
    letterSpacing: '0.125rem',
    height: '2.25rem',
  },
  borderless: {
    backgroundColor: 'transparent',
    textColor: '#337ab7',
    padding: '0',
    fontFamily: "'Nunito Sans', sans-serif",
    letterSpacing: '0.125rem',
    height: 'auto',
  },
  whiteOutline: {
    backgroundColor: '#ffffff',
    textColor: '#252525',
    borderColor: '#252525',
    borderWidth: '1px',
    hoverBackgroundColor: '#252525',
    hoverTextColor: '#ffffff',
    padding: '0.5rem 3rem',
    fontFamily: "'Nunito', sans-serif",
    letterSpacing: '1.06px',
    height: '2.5rem',
  },
} as const

export type ButtonColorScheme = keyof typeof BUTTON_COLOR_SCHEMES
