import { ModalBody, ModalHeader } from '@faststore/ui'

import BaseModal from '../BaseModal/BaseModal'
import Button from '../Button/Button'
import Link from '../Link/Link'
import styles from './LoginModal.module.scss'
import type { LoginModalProps } from './LoginModal.types'

/**
 * Sign-in modal: a way into the login page, then the account types available
 * to new customers. `/login` is FastStore's own route, which hands off to
 * VTEX ID -- that page already offers both password and one-time access code,
 * so the modal does not split them.
 */
export default function LoginModal({
  open,
  onClose,
  createAccountText = 'To create an account, add an account type to your cart and proceed through the checkout process.',
  accountCards = [],
}: LoginModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      className={styles.loginModal}
      ariaLabel="Login"
    >
      <ModalHeader title="Already Registered?" onClose={onClose} />
      <ModalBody>
        <div className={styles.loginModal__loginRow}>
          <Button
            href="/login"
            colorScheme="green"
            className={styles.loginModal__loginCta}
          >
            LOGIN
          </Button>
        </div>

        <hr className={styles.loginModal__divider} />

        <p className={styles.loginModal__createTitle}>Create an Account</p>
        <p className={styles.loginModal__createText}>{createAccountText}</p>

        <div className={styles.loginModal__cards}>
          {accountCards.map((card) => (
            <div key={card.title} className={styles.loginModal__card}>
              <p className={styles.loginModal__cardTitle}>{card.title}</p>
              {card.subtitle && (
                <p className={styles.loginModal__cardSubtitle}>
                  {card.subtitle}
                </p>
              )}
              {card.description && (
                <p className={styles.loginModal__cardDescription}>
                  {card.description}
                </p>
              )}
              {card.price && (
                <p className={styles.loginModal__cardPrice}>{card.price}</p>
              )}
              {card.addToCartUrl && (
                <Button
                  href={card.addToCartUrl}
                  colorScheme="green"
                  className={styles.loginModal__cardCta}
                >
                  ADD TO CART
                </Button>
              )}
              {card.learnMoreUrl && (
                <Link
                  className={styles.loginModal__cardLearnMore}
                  href={card.learnMoreUrl}
                >
                  Learn More
                </Link>
              )}
            </div>
          ))}
        </div>
      </ModalBody>
    </BaseModal>
  )
}
