import { useEffect, useState } from 'react'
import { Icon } from '@faststore/ui'

import { getGlobalSettings } from 'src/utils/globalSettings'

import { slugHref } from '../../utils/href'
import CartButton from '../CartButton/CartButton'
import CountrySelectorModal from '../CountrySelectorModal/CountrySelectorModal'
import LoginModal from '../LoginModal/LoginModal'
import MegaMenuPanel from '../MegaMenuPanel/MegaMenuPanel'
import MobileMenu from '../MobileMenu/MobileMenu'
import MobileTabItem from '../MobileTabItem/MobileTabItem'
import SearchBox from '../SearchBox/SearchBox'
import styles from './Header.module.scss'
import type { HeaderProps } from './Header.types'

/**
 * Flag for the active locale, taken from the inline SVG Content Platform
 * ships per region -- no uploaded asset needed. It is clipped to a circle,
 * which is a deliberate departure from prod's rectangular flag.
 */
function LocaleFlag() {
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
  searchPlaceholder,
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
    const handleScroll = () =>
      setIsScrolled((scrolled) => window.scrollY > (scrolled ? 10 : 80))

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isScrolled) {
      setOpenIndex(null)
    }
  }, [isScrolled])

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
            <SearchBox placeholder={searchPlaceholder} />
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Login"
              onClick={() => setLoginOpen(true)}
            >
              <Icon name="User" width={24} height={24} />
              <span>Login</span>
            </button>
            <CartButton />
            <button
              type="button"
              className={styles.header__iconButton}
              aria-label="Select country"
              onClick={() => setCountryOpen(true)}
            >
              <LocaleFlag />
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
            <LocaleFlag />
          </button>

          {logo?.src && (
            <a className={styles.header__logo} href={logo.url ?? '/'}>
              <img src={logo.src} alt={logo.alt ?? ''} />
            </a>
          )}

          <div className={styles.header__mobileTopBarIcons}>
            <SearchBox placeholder={searchPlaceholder} />
            <CartButton />
          </div>
        </div>

        <nav className={styles.header__nav}>
          <ul className={styles.header__navList}>
            {navItems.map((item, index) => (
              <li key={index} className={styles.header__navItem}>
                <a href={slugHref(item.slug)}>{item.name}</a>
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
              const onActivate =
                item.type === 'modal'
                  ? () =>
                      item.modal === 'country'
                        ? setCountryOpen(true)
                        : setLoginOpen(true)
                  : item.type === 'menu'
                    ? () => setMobileMenuOpen(true)
                    : undefined

              return (
                <MobileTabItem
                  key={index}
                  item={item}
                  onActivate={onActivate}
                />
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
