import { Modal, ModalBody, ModalHeader } from '@faststore/ui'

import Button from '../Button/Button'
import styles from './LoginModal.module.scss'
import type { LoginModalProps } from './LoginModal.types'

export default function LoginModal({
  open,
  onClose,
  loginUrl = '#',
  otpLoginUrl = '#',
  createAccountText = 'To create an account, add an account type to your cart and proceed through the checkout process.',
  accountCards = [],
}: LoginModalProps) {
  return (
    <Modal
      isOpen={open}
      onDismiss={onClose}
      className={styles.loginModal}
      aria-label="Login"
    >
      <ModalHeader title="Already Registered?" onClose={onClose} />
      <ModalBody>
        <div className={styles.loginModal__loginRow}>
          <Button href={loginUrl} colorScheme="green">
            LOGIN
          </Button>
          <span className={styles.loginModal__or}>OR</span>
          <Button href={otpLoginUrl} colorScheme="whiteOutline">
            LOG IN WITH A ONE-TIME CODE
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
                <a
                  className={styles.loginModal__cardLearnMore}
                  href={card.learnMoreUrl}
                >
                  Learn More
                </a>
              )}
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  )
}
