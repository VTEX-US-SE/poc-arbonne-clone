import { useEffect, useState } from 'react'
import { Icon, ModalBody, ModalHeader } from '@faststore/ui'
import {
  useBindingSelector_unstable as useBindingSelector,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import BaseModal from '../BaseModal/BaseModal'
import styles from './CountrySelectorModal.module.scss'
import type { CountrySelectorModalProps } from './CountrySelectorModal.types'

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

  // `save` closes over the locale in state, so it cannot run in the same tick
  // as `setLocaleCode` -- it would resolve the binding we are leaving. Wait
  // for the selection to commit, then redirect with the fresh callback.
  useEffect(() => {
    if (pendingLocale && localeCode === pendingLocale) {
      setPendingLocale(null)
      save()
    }
  }, [pendingLocale, localeCode, save])

  const localeEntries = Object.entries(languages ?? {})
  const isLocalized = localeEntries.length > 1

  const handleClose = () => {
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
            ? localeEntries.map(([code, name]) => {
                const active = code === localeCode

                return (
                  <li
                    key={code}
                    className={styles.countrySelectorModal__item}
                    data-active={active || undefined}
                    onClick={() => handleSelectLocale(code)}
                  >
                    <span className={styles.countrySelectorModal__label}>
                      {name}
                    </span>
                    {active && (
                      <Icon
                        className={styles.countrySelectorModal__check}
                        name="Checked"
                        width={16}
                        height={16}
                      />
                    )}
                  </li>
                )
              })
            : options.map((option, index) => (
                <li
                  key={option.label}
                  className={styles.countrySelectorModal__item}
                  data-active={option.active || undefined}
                  onClick={() => onSelect?.(index)}
                >
                  <span className={styles.countrySelectorModal__label}>
                    {option.label}
                  </span>
                  {option.active && (
                    <Icon
                      className={styles.countrySelectorModal__check}
                      name="Checked"
                      width={16}
                      height={16}
                    />
                  )}
                </li>
              ))}
        </ul>
      </ModalBody>
    </BaseModal>
  )
}
