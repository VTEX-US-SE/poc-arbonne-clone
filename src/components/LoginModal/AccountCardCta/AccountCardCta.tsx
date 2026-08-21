import { Loader } from '@faststore/ui'

import storeConfig from 'discovery.config'
import { useCart } from 'src/sdk/cart'
import { redirectToCheckout } from 'src/sdk/cart/redirectToCheckout'

import useAddSkuToCart from '../../../hooks/useAddSkuToCart'
import Button from '../../Button/Button'
import styles from './AccountCardCta.module.scss'
import type { AccountCardCtaProps } from './AccountCardCta.types'

/**
 * Adds an account type to the cart and leaves for checkout, the way `JoinForm`
 * does. The registration SKU is not resolvable through the storefront's product
 * graph, so it cannot be described well enough for FastStore's own cart -- and
 * that cart is authoritative, so a line it does not know gets dropped on the
 * next validation.
 *
 * Its own component so `useCart` only subscribes while the modal is open.
 * `LoginModal` renders from `Header` on every page, and a cart subscription up
 * there runs on every render even with the modal closed.
 */
export default function AccountCardCta({
  skuId,
  label = 'ADD TO CART',
  className,
}: AccountCardCtaProps) {
  const { id: orderFormId } = useCart()
  const { addSku, adding, error } = useAddSkuToCart()

  return (
    <>
      <Button
        // Absolute, not `/checkout`: a navigation this handler does not
        // intercept -- before hydration, or a modified click -- would otherwise
        // land on the storefront's catch-all route rather than real checkout.
        href={storeConfig.checkoutUrl}
        colorScheme="green"
        className={className}
        aria-busy={adding}
        onClick={async (event) => {
          event.preventDefault()

          // `disabled` on an anchor does not block clicks, so the guard is here.
          if (adding) {
            return
          }

          const cartId = await addSku({
            skuId,
            orderFormId: orderFormId || undefined,
          })

          if (cartId) {
            redirectToCheckout(cartId)
          }
        }}
      >
        {adding ? <Loader variant="light" /> : label}
      </Button>
      {error && <p className={styles.accountCardCta__error}>{error}</p>}
    </>
  )
}
