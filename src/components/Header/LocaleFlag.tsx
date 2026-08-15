import { getGlobalSettings } from 'src/utils/globalSettings'

import styles from './Header.module.scss'

/**
 * Flag for the active locale, taken from the inline SVG Content Platform
 * ships per region -- no uploaded asset needed. It is clipped to a circle,
 * which is a deliberate departure from prod's rectangular flag.
 */
export default function LocaleFlag() {
  const settings = getGlobalSettings() as {
    locale_metadata?: { region?: { name?: string; flag?: string } }
  }
  const region = settings?.locale_metadata?.region

  if (!region?.flag) {
    return null
  }

  return (
    <span
      className={styles.header__flag}
      role="img"
      aria-label={region.name ?? ''}
      dangerouslySetInnerHTML={{ __html: region.flag }}
    />
  )
}
