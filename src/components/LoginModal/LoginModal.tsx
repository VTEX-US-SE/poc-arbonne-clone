import { ModalBody, ModalHeader } from '@faststore/ui'

import BaseModal from '../BaseModal/BaseModal'
import Button from '../Button/Button'
import Link from '../Link/Link'
import styles from './LoginModal.module.scss'
import type { LoginModalProps } from './LoginModal.types'

/**
 * Sign-in modal: the two login routes, then the account types available to
 * new customers. Authentication itself is not wired up -- the buttons link
 * out to the account URLs from the CMS.
 */
export default function LoginModal({
  open,
  onClose,
  loginUrl,
  otpLoginUrl,
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
        {/* Each route is rendered only when the CMS supplies its URL -- these
            defaulted to `'#'`, which put two dead buttons in front of anyone
            trying to sign in. The "OR" divider needs both to be meaningful. */}
        {(loginUrl || otpLoginUrl) && (
          <div className={styles.loginModal__loginRow}>
            {loginUrl && (
              <Button href={loginUrl} colorScheme="green">
                LOGIN
              </Button>
            )}
            {loginUrl && otpLoginUrl && (
              <span className={styles.loginModal__or}>OR</span>
            )}
            {otpLoginUrl && (
              <Button href={otpLoginUrl} colorScheme="greenOutline">
                LOG IN WITH A ONE-TIME CODE
              </Button>
            )}
          </div>
        )}

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
