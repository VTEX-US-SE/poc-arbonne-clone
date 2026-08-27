import { Icon } from '@faststore/ui'
import storeConfig from 'discovery.config'
import { useSession } from 'src/sdk/session'

import Link from '../Link/Link'
import styles from './AccountButton.module.scss'
import type { AccountButtonProps } from './AccountButton.types'

/**
 * Where My Account is served from. The flag decides it, exactly as core's own
 * `ButtonSignIn` does -- with it off, the account lives in the IO app at an
 * absolute URL, which is why this goes through `Link` rather than `next/link`.
 */
const ACCOUNT_URL = storeConfig.experimental?.enableFaststoreMyAccount
  ? '/pvt/account'
  : storeConfig.accountUrl

/**
 * Initials from the shopper's own name, falling back to their email -- a
 * profile with only one of the two names still has to produce something rather
 * than an empty circle.
 */
function initialsFrom(person: {
  givenName?: string | null
  familyName?: string | null
  email?: string | null
}) {
  const initials = [person.givenName, person.familyName]
    .map((part) => part?.trim()?.[0] ?? '')
    .join('')
    .toUpperCase()

  return initials || (person.email?.trim()?.[0]?.toUpperCase() ?? '')
}

/**
 * Login, or the shopper's own initials once they are.
 *
 * Signed out it keeps the header's icon-button treatment; signed in it becomes
 * a link straight to My Account, so the header stops offering a login to
 * someone who already has one.
 */
export default function AccountButton({
  onLoginClick,
  className,
}: AccountButtonProps) {
  const { person } = useSession()

  if (!person?.id) {
    return (
      <button
        aria-label="Login"
        className={className}
        onClick={onLoginClick}
        type="button"
      >
        <Icon name="User" width={24} height={24} />
        <span>Join</span>
      </button>
    )
  }

  const name = [person.givenName, person.familyName].filter(Boolean).join(' ')

  return (
    <Link
      aria-label={name ? `My account, ${name}` : 'My account'}
      className={styles.accountButton}
      href={ACCOUNT_URL}
    >
      <span aria-hidden="true">{initialsFrom(person)}</span>
    </Link>
  )
}
