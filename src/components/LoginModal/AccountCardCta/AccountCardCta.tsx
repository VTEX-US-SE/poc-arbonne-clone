import {
  useBuyButton_unstable as useBuyButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { useMemo } from 'react'
import type {
  ArbRegistrationProductQueryQuery,
  ArbRegistrationProductQueryQueryVariables,
} from '@generated/graphql'
import { cartStore, useCart } from 'src/sdk/cart'
import { useQuery } from 'src/sdk/graphql/useQuery'
import { useSession } from 'src/sdk/session'

import Button from '../../Button/Button'
import { query } from '../../../graphql/queries/registrationProduct'
import styles from './AccountCardCta.module.scss'
import type { AccountCardCtaProps } from './AccountCardCta.types'

/**
 * Adds an account type to the cart from somewhere that never queried it -- the
 * login modal has no page product to read.
 *
 * `useBuyButton` opens the cart drawer itself, so there is no `openCart` call
 * here. Its own component so the hooks only run while the modal is open:
 * `LoginModal` renders from `Header` on every page.
 */
export default function AccountCardCta({
  skuId,
  label = 'ADD TO CART',
  className,
  onAdded,
  exclusiveSkus = [],
}: AccountCardCtaProps) {
  const { channel, locale } = useSession()
  const { items } = useCart()

  const variables = useMemo(
    () => ({
      locator: [
        { key: 'id', value: skuId },
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale ?? '' },
      ],
    }),
    [skuId, channel, locale]
  )

  const { data, error, isLoading } = useQuery<
    ArbRegistrationProductQueryQuery,
    ArbRegistrationProductQueryQueryVariables
  >(query, variables, { doNotRun: !skuId, revalidateOnMount: true })

  const product = data?.product
  const offer = product?.offers?.offers?.[0]

  // The CTA can only disable itself when there is no offer, which looks
  // identical whether the query failed or the SKU is unavailable.
  if (!isLoading && (error || (data && !product))) {
    console.error('[arb] no offer for SKU', skuId, error ?? data)
  }

  const buyProps = useBuyButton(
    product && offer
      ? {
          id: product.id,
          price: offer.price,
          priceWithTaxes: offer.priceWithTaxes,
          listPrice: offer.listPrice,
          listPriceWithTaxes: offer.listPriceWithTaxes,
          seller: offer.seller,
          quantity: 1,
          itemOffered: {
            sku: product.sku,
            name: product.name,
            gtin: product.gtin,
            image: [product.image?.[0]],
            brand: product.brand,
            isVariantOf: product.isVariantOf,
            additionalProperty: product.additionalProperty,
            unitMultiplier: product.unitMultiplier,
          },
        }
      : null
  )

  return (
    <Button
      {...buyProps}
      colorScheme="green"
      className={[styles.accountCardCta, className].filter(Boolean).join(' ')}
      disabled={!product || !offer}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        buyProps.onClick(event)

        // After the add, so a failure cannot leave the cart with neither. The
        // id is the composed `sku::seller::propertyIDs`, not the SKU.
        items
          .filter(
            (item) =>
              item.itemOffered.sku !== skuId &&
              exclusiveSkus.includes(item.itemOffered.sku)
          )
          .forEach((item) => cartStore.removeItem(item.id))
        // After the add, so the drawer is not revealed behind a live modal.
        onAdded?.()
      }}
    >
      {label}
    </Button>
  )
}
