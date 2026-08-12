import { useState } from 'react'
import { Icon, ModalBody } from '@faststore/ui'

import { slugHref } from '../../utils/href'
import BaseModal from '../BaseModal/BaseModal'
import styles from './MobileMenu.module.scss'
import type { MobileMenuProps } from './MobileMenu.types'

/**
 * Full-screen mobile equivalent of the desktop mega-menu: same `navItems`
 * tree, presented as a tap-to-expand accordion instead of hover dropdowns.
 * Its own expand/collapse state is separate from Header's `openIndex`,
 * since this is a fundamentally different interaction (always-visible
 * list vs. hover-show/hide panel).
 */
export default function MobileMenu({
  open,
  onClose,
  navItems = [],
}: MobileMenuProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      className={styles.mobileMenu}
      ariaLabel="Menu"
    >
      <button
        type="button"
        className={styles.mobileMenu__close}
        onClick={onClose}
        aria-label="Close menu"
      >
        <Icon name="X" weight="bold" width={18} height={18} />
      </button>

      <ModalBody>
        <ul className={styles.mobileMenu__list}>
          {navItems.map((item, index) => {
            const expanded = expandedIndex === index

            return (
              <li key={index} className={styles.mobileMenu__item}>
                <button
                  type="button"
                  className={styles.mobileMenu__itemHeader}
                  aria-expanded={expanded}
                  onClick={() => setExpandedIndex(expanded ? null : index)}
                >
                  {item.name}
                  <Icon name="CaretDown" width={14} height={14} />
                </button>

                {expanded && item.menu?.length ? (
                  <ul className={styles.mobileMenu__submenu}>
                    {item.menu.map((column, columnIndex) => (
                      <li key={columnIndex}>
                        {column.menu?.length ? (
                          <>
                            <p className={styles.mobileMenu__columnTitle}>
                              {column.name}
                            </p>
                            <ul>
                              {column.menu.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                  <a
                                    className={styles.mobileMenu__link}
                                    href={slugHref(link.slug)}
                                  >
                                    {link.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <a
                            className={styles.mobileMenu__link}
                            href={slugHref(column.slug)}
                          >
                            {column.name}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </ModalBody>
    </BaseModal>
  )
}
