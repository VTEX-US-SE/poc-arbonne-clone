import { useSession } from 'src/sdk/session'

import { regionCodeFor } from '../../utils/locale'
import styles from './LocaleFlag.module.scss'
import type { LocaleFlagProps } from './LocaleFlag.types'

/**
 * Flag for a locale's region. Defaults to the active session locale, which is
 * what the header wants; the language picker passes each row's own `locale` so
 * one flag per option can sit beside its label.
 *
 * The region is resolved from the session rather than from Content Platform's
 * global settings -- those expose a single store-level `locale_metadata.region`,
 * so every locale rendered the same (US) flag regardless of the binding in use.
 *
 * Assets are plain files at `public/flag-<iso>.svg`, so a new market needs a
 * dropped-in file rather than a code change. They sit **flat in `public/`, not
 * in a subfolder** -- the CLI's public-copy filter tests every path against a
 * list of allowed extensions plus the literal "public", and `fs-extra` applies
 * it to directories too, so any subdirectory of `public/` fails the test and is
 * never recursed into. `public/flags/us.svg` silently never reached the build.
 *
 * Renders nothing when the region is unknown: a wrong flag is worse than none.
 */
export default function LocaleFlag({ locale }: LocaleFlagProps = {}) {
  const { locale: sessionLocale } = useSession()
  const region = regionCodeFor(locale ?? sessionLocale)?.toLowerCase()

  if (!region) {
    return null
  }

  return (
    <img
      className={styles.localeFlag}
      src={`/flag-${region}.svg`}
      alt=""
      width={24}
      height={24}
    />
  )
}
