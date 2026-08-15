import { useEffect, useState } from 'react'
import { ModalBody, ModalHeader } from '@faststore/ui'
import {
  useBindingSelector_unstable as useBindingSelector,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import BaseModal from '../BaseModal/BaseModal'
import styles from './CountrySelectorModal.module.scss'
import type { CountrySelectorModalProps } from './CountrySelectorModal.types'
import LocaleRow from './LocaleRow'

/**
 * Language picker. Drives the real locale switch when the account exposes
 * more than one locale: picking a language resolves its binding and
 * redirects, preserving the current path.
 *
 * Falls back to the CMS `options` while only one locale is configured --
 * adding a locale needs a new VTEX binding, which is a support request, so
 * this renders the visual mock until that lands.
 */
export default function CountrySelectorModal({
  open,
  onClose,
  title = 'Select Language',
  options = [],
  onSelect,
}: CountrySelectorModalProps) {
  const { languages, localeCode, setLocaleCode, save, reset } =
    useBindingSelector()
  const [pendingLocale, setPendingLocale] = useState<string | null>(null)

  useEffect(() => {
    if (pendingLocale && localeCode === pendingLocale) {
      save()
    }
  }, [pendingLocale, localeCode, save])

  const localeEntries = Object.entries(
    (languages ?? {}) as Record<string, string>
  )
  const isLocalized = localeEntries.length > 1
  const switching = pendingLocale !== null

  const handleClose = () => {
    setPendingLocale(null)
    reset()
    onClose?.()
  }

  const handleSelectLocale = (code: string) => {
    if (code === localeCode) {
      return
    }

    setPendingLocale(code)
    setLocaleCode(code)
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      className={styles.countrySelectorModal}
      ariaLabel={title}
    >
      <ModalHeader title={title} onClose={handleClose} />
      <ModalBody>
        <ul className={styles.countrySelectorModal__list}>
          {isLocalized
            ? localeEntries.map(([code, name]) => (
                <LocaleRow
                  key={code}
                  label={name}
                  active={code === localeCode}
                  pending={code === pendingLocale}
                  disabled={switching}
                  onSelect={() => handleSelectLocale(code)}
                />
              ))
            : options.map((option, index) => (
                <LocaleRow
                  key={option.label}
                  label={option.label}
                  active={option.active}
                  onSelect={() => onSelect?.(index)}
                />
              ))}
        </ul>
      </ModalBody>
    </BaseModal>
  )
}
