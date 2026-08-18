import { Icon, ModalBody, ModalHeader } from '@faststore/ui'

import BaseModal from '../../BaseModal/BaseModal'
import styles from './SetAddedModal.module.scss'
import type { SetAddedModalProps } from './SetAddedModal.types'

/**
 * Confirmation after a composed set reaches the cart.
 *
 * The cart sidebar cannot stand in for this: FastStore's cart model has no
 * concept of an assembly binding, so it would list the children as unrelated
 * products and hide the fact that they form a set. This shows the set as one
 * thing and then hands over to Checkout, which does understand the binding.
 */
export default function SetAddedModal({
  open,
  setName,
  sets,
  lines,
  formattedTotal,
  notice,
  onKeepCustomizing,
  onCheckout,
}: SetAddedModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onKeepCustomizing}
      className={styles.setAddedModal}
      ariaLabel="Set added to cart"
    >
      <ModalHeader title="Added to cart" onClose={onKeepCustomizing} />
      <ModalBody>
        <p className={styles.setAddedModal__set}>
          <Icon
            className={styles.setAddedModal__tick}
            name="CheckCircle"
            width={20}
            height={20}
          />
          {sets > 1 ? `${sets} × ${setName}` : setName}
        </p>

        <ul className={styles.setAddedModal__lines}>
          {lines.map((line) => (
            <li key={line.name}>
              <span>{line.name}</span>
              <span className={styles.setAddedModal__quantity}>
                × {line.quantity}
              </span>
            </li>
          ))}
        </ul>

        {formattedTotal && (
          <p className={styles.setAddedModal__total}>
            <span>Cart total</span>
            <strong>{formattedTotal}</strong>
          </p>
        )}

        {notice && <p className={styles.setAddedModal__notice}>{notice}</p>}

        {/* Plain buttons, not `Button`: that wraps `LinkButton` and requires an
            `href`, and both of these are actions. Same visual language as the
            builder's own CTA. */}
        <div className={styles.setAddedModal__actions}>
          <button
            type="button"
            className={styles.setAddedModal__secondary}
            onClick={onKeepCustomizing}
          >
            KEEP CUSTOMIZING
          </button>
          <button
            type="button"
            className={styles.setAddedModal__primary}
            onClick={onCheckout}
          >
            CHECKOUT
          </button>
        </div>
      </ModalBody>
    </BaseModal>
  )
}
