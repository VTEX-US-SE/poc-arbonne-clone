import { ModalBody, ModalHeader } from '@faststore/ui'

import AccountCardCta from './AccountCardCta/AccountCardCta'
import BaseModal from '../BaseModal/BaseModal'
import Button from '../Button/Button'
import Link from '../Link/Link'
import styles from './LoginModal.module.scss'
import type { LoginModalProps } from './LoginModal.types'

/**
 * ponytail: the account type this modal sells, when a card carries no `skuId`.
 * A second card (Consultant) would set its own in the CMS.
 */
const REGISTRATION_SKU = '9048'

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
  const accountSkus = accountCards.map((card) => card.skuId ?? REGISTRATION_SKU)

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
              <AccountCardCta
                skuId={card.skuId ?? REGISTRATION_SKU}
                className={styles.loginModal__cardCta}
                onAdded={onClose}
                exclusiveSkus={accountSkus}
              />
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
