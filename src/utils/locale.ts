import storeConfig from 'discovery.config'

interface ConfigLocale {
  /** Native language name, lowercased by the platform ("français"). */
  name: string
  /** ISO 3166-1 alpha-2 region ("CA"). */
  regionCode: string
}

/**
 * Populated by the CLI from the account's real VTEX bindings, so this is empty
 * whenever `localization.enabled` is false.
 */
const locales: Record<string, ConfigLocale> =
  (storeConfig as { localization?: { locales?: Record<string, ConfigLocale> } })
    .localization?.locales ?? {}

/**
 * Language name plus its region code -- "Français (CA)".
 *
 * Core's own `buildLanguageOptions` appends the region only when two locales
 * share a language name, so a set of distinct names (english/français/español)
 * renders with no region at all. `en-US` and `es-US` differ *only* by language
 * while sharing a region, and the region drives currency and sales channel, so
 * both halves are always shown here.
 *
 * Falls back to the raw locale code for anything not in the config.
 */
export const localeLabel = (code: string) => {
  const locale = locales[code]

  if (!locale) {
    return code
  }

  const language = locale.name.charAt(0).toUpperCase() + locale.name.slice(1)

  return `${language} (${locale.regionCode})`
}

/**
 * ISO region for a locale code, used to pick its flag. `undefined` when the
 * locale is unknown, which callers should treat as "render no flag" rather
 * than substituting a default -- a wrong flag is worse than none.
 */
export const regionCodeFor = (code?: string) =>
  code ? locales[code]?.regionCode : undefined
