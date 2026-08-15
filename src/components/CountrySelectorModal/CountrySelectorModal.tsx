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
      // Deliberately left set: `save()` navigates, and clearing it here would
      // drop the row back to its resting state for the whole redirect. Closing
      // the modal is the way out if the binding never resolves.
      save()
    }
  }, [pendingLocale, localeCode, save])

  // `useBindingSelector` is untyped experimental API -- name the shape here so
  // the entries render as text rather than `unknown`.
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
                  // The whole list locks while a switch is in flight: `save()`
                  // navigates, so a second pick would race the redirect.
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
