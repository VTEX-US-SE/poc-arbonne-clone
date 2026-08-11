import { useEffect, useState } from 'react'
import { Icon } from '@faststore/ui'

import CountrySelectorModal from '../CountrySelectorModal/CountrySelectorModal'
import LoginModal from '../LoginModal/LoginModal'
import MegaMenuPanel from '../MegaMenuPanel/MegaMenuPanel'
import MobileMenu from '../MobileMenu/MobileMenu'
import styles from './Header.module.scss'
import type { HeaderProps } from './Header.types'

/**
 * Site-wide header: centered logo, utility icons, and a top nav row whose
 * items, dropdown columns, and each dropdown's promo banner all come
 * from this component's own `navItems` CMS field, edited directly in
 * Admin -- vtex.mega-menu, originally targeted for this data, turned out
 * to be deprecated/unmaintained by VTEX with a non-functional admin UI.
 * Sticky at every breakpoint; on desktop, scrolling also collapses the
 * nav row away (see `isScrolled` below and Header.module.scss) so the
 * sticky bar shrinks to just the compact logo/utility row.
 */
export default function Header({
  logo,
  navItems = [],
  loginUrl,
  otpLoginUrl,
  createAccountText,
  accountCards,
  countryOptions = [],
  mobileNavItems = [],
}: HeaderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(() =>
    Math.max(
      countryOptions.findIndex((option) => option.active),
      0
    )
  )
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openItem = openIndex !== null ? navItems[openIndex] : undefined
  const banner = openItem?.banner
  const selectedCountry = countryOptions[selectedCountryIndex]

  return (
    <>
      <header
        className={styles.header}
        data-arb-header
        data-scrolled={isScrolled || undefined}
      >
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
            <a href="#" className={styles.header__iconButton} aria-label="Cart">
              <Icon name="Bag" width={22} height={22} />
            </a>
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Select country"
              onClick={() => setCountryOpen(true)}
            >
              {selectedCountry?.flag && (
                <img
                  className={styles.header__flag}
                  src={selectedCountry.flag}
                  alt=""
                />
              )}
              <Icon name="CaretDown" width={10} height={10} />
            </button>
          </div>
        </div>

        <div className={styles.header__mobileTopBar}>
          <button
            type="button"
            className={styles.header__mobileFlagButton}
            aria-label="Select country"
            onClick={() => setCountryOpen(true)}
          >
            {selectedCountry?.flag && (
              <img
                className={styles.header__flag}
                src={selectedCountry.flag}
                alt=""
              />
            )}
          </button>

          {logo?.src && (
            <a className={styles.header__logo} href={logo.url ?? '/'}>
              <img src={logo.src} alt={logo.alt ?? ''} />
            </a>
          )}

          <div className={styles.header__mobileTopBarIcons}>
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Search"
            >
              <Icon name="MagnifyingGlass" width={22} height={22} />
            </button>
            <a href="#" className={styles.header__iconButton} aria-label="Cart">
              <Icon name="Bag" width={22} height={22} />
            </a>
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
                    <Icon
                      name={openIndex === index ? 'CaretUp' : 'CaretDown'}
                      weight="bold"
                      width={12}
                      height={12}
                    />
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

        {mobileNavItems.length > 0 && (
          <nav
            className={styles.header__mobileTabBar}
            aria-label="Mobile navigation"
            data-arb-mobile-tabbar
          >
            {mobileNavItems.map((item, index) => {
              const icon = item.icon && (
                <img
                  className={styles.header__mobileTabIcon}
                  src={item.icon}
                  alt=""
                />
              )
              const label = <span>{item.label}</span>

              if (item.type === 'modal') {
                return (
                  <button
                    key={index}
                    type="button"
                    className={styles.header__mobileTabItem}
                    onClick={() =>
                      item.modal === 'country'
                        ? setCountryOpen(true)
                        : setLoginOpen(true)
                    }
                  >
                    {icon}
                    {label}
                  </button>
                )
              }

              if (item.type === 'menu') {
                return (
                  <button
                    key={index}
                    type="button"
                    className={styles.header__mobileTabItem}
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    {icon}
                    {label}
                  </button>
                )
              }

              return (
                <a
                  key={index}
                  className={styles.header__mobileTabItem}
                  href={item.url ?? '#'}
                >
                  {icon}
                  {label}
                </a>
              )
            })}
          </nav>
        )}
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
        options={countryOptions.map((option, index) => ({
          ...option,
          active: index === selectedCountryIndex,
        }))}
        onSelect={(index) => {
          setSelectedCountryIndex(index)
          setCountryOpen(false)
        }}
      />

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  )
}
