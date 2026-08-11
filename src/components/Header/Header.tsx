import { useState } from 'react'
import { Icon } from '@faststore/ui'

import CountrySelectorModal from '../CountrySelectorModal/CountrySelectorModal'
import LoginModal from '../LoginModal/LoginModal'
import MegaMenuPanel from '../MegaMenuPanel/MegaMenuPanel'
import styles from './Header.module.scss'
import type { HeaderProps } from './Header.types'

/**
 * Site-wide header: centered logo, utility icons, and a top nav row whose
 * items, dropdown columns, and each dropdown's promo banner all come
 * from this component's own `navItems` CMS field, edited directly in
 * Admin -- vtex.mega-menu, originally targeted for this data, turned out
 * to be deprecated/unmaintained by VTEX with a non-functional admin UI.
 * Desktop only for now -- no mobile nav yet.
 */
export default function Header({
  logo,
  navItems = [],
  loginUrl,
  otpLoginUrl,
  createAccountText,
  accountCards,
  countryOptions,
}: HeaderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  const openItem = openIndex !== null ? navItems[openIndex] : undefined
  const banner = openItem?.banner

  return (
    <>
      <header className={styles.header} data-arb-header>
        <div className={styles.header__topRow}>
          {logo?.src && (
            <a className={styles.header__logo} href={logo.url ?? '/'}>
              <img src={logo.src} alt={logo.alt ?? ''} />
            </a>
          )}

          <div className={styles.header__utility}>
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Search"
            >
              <Icon name="MagnifyingGlass" width={22} height={22} />
            </button>
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Login"
              onClick={() => setLoginOpen(true)}
            >
              <Icon name="User" width={22} height={22} />
              <span>Login</span>
            </button>
            <a
              href="/cart"
              className={styles.header__iconButton}
              aria-label="Cart"
            >
              <Icon name="Bag" width={22} height={22} />
            </a>
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Select country"
              onClick={() => setCountryOpen(true)}
            >
              <Icon name="Globe" width={22} height={22} />
            </button>
          </div>
        </div>

        <nav className={styles.header__nav}>
          <ul className={styles.header__navList}>
            {navItems.map((item, index) => (
              <li key={index} className={styles.header__navItem}>
                <a href={item.slug ? `/${item.slug}` : '#'}>{item.name}</a>
                {Boolean(item.menu?.length) && (
                  <button
                    type="button"
                    className={styles.header__navToggle}
                    aria-label={`Toggle ${item.name} menu`}
                    aria-expanded={openIndex === index}
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <Icon name="CaretDown" width={12} height={12} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {openItem?.menu?.length ? (
            <div className={styles.header__panelWrapper}>
              <MegaMenuPanel
                columns={openItem.menu}
                banner={banner}
                onClose={() => setOpenIndex(null)}
              />
            </div>
          ) : null}
        </nav>
      </header>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        loginUrl={loginUrl}
        otpLoginUrl={otpLoginUrl}
        createAccountText={createAccountText}
        accountCards={accountCards}
      />

      <CountrySelectorModal
        open={countryOpen}
        onClose={() => setCountryOpen(false)}
        options={countryOptions}
      />
    </>
  )
}
