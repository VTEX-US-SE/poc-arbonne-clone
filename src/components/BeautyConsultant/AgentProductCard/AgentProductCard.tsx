import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import NextLink from 'next/link'
import {
  useBuyButton_unstable as useBuyButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import type {
  ArbRegistrationProductQueryQuery,
  ArbRegistrationProductQueryQueryVariables,
} from '@generated/graphql'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'
import { useQuery } from 'src/sdk/graphql/useQuery'
import { useSession } from 'src/sdk/session'

import { query as registrationProductQuery } from '../../../graphql/queries/registrationProduct'
import { safeProductHref } from '../../../utils/agentChat'
import Button from '../../Button/Button'
import styles from './AgentProductCard.module.scss'
import type { AgentProductCardProps } from './AgentProductCard.types'

export default function AgentProductCard({
  product,
  variant = 'link',
  onAskAbout,
}: AgentProductCardProps) {
  const formatPrice = usePriceFormatter({ decimals: true })
  const [href, setHref] = useState<string | null>(null)
  const { channel, locale } = useSession()

  useEffect(() => {
    setHref(safeProductHref(product.url, window.location.origin))
  }, [product.url])

  const variables = useMemo(
    () => ({
      locator: [
        { key: 'id', value: product.sku },
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale ?? '' },
      ],
    }),
    [channel, locale, product.sku]
  )

  const { data } = useQuery<
    ArbRegistrationProductQueryQuery,
    ArbRegistrationProductQueryQueryVariables
  >(registrationProductQuery, variables, {
    doNotRun: variant !== 'shelf' || !product.sku,
    revalidateOnMount: true,
  })

  const cartProduct = data?.product
  const offer = cartProduct?.offers?.offers?.[0]

  const buyProps = useBuyButton(
    cartProduct && offer
      ? {
          id: cartProduct.id,
          price: offer.price,
          priceWithTaxes: offer.priceWithTaxes,
          listPrice: offer.listPrice,
          listPriceWithTaxes: offer.listPriceWithTaxes,
          seller: offer.seller,
          quantity: 1,
          itemOffered: {
            sku: cartProduct.sku,
            name: cartProduct.name,
            gtin: cartProduct.gtin,
            image: [cartProduct.image?.[0]],
            brand: cartProduct.brand,
            isVariantOf: cartProduct.isVariantOf,
            additionalProperty: cartProduct.additionalProperty,
            unitMultiplier: cartProduct.unitMultiplier,
          },
        }
      : null
  )

  const media = (
    <div className={styles.agentProductCard__media}>
      {product.image ? (
        <img src={product.image} alt="" width={160} height={160} loading="lazy" />
      ) : (
        <div className={styles.agentProductCard__mediaFallback} aria-hidden />
      )}
    </div>
  )

  const body = (
    <div className={styles.agentProductCard__body}>
      {href ? (
        <NextLink
          className={styles.agentProductCard__nameLink}
          href={href}
          prefetch={false}
        >
          {product.name}
        </NextLink>
      ) : (
        <span className={styles.agentProductCard__name}>{product.name}</span>
      )}
      {product.price !== undefined && (
        <span className={styles.agentProductCard__price}>
          {formatPrice(product.price)}
        </span>
      )}
      {variant === 'link' && (
        <span className={styles.agentProductCard__action}>
          {href ? 'View product' : 'Product details unavailable'}
        </span>
      )}
      {variant === 'shelf' && (
        <div className={styles.agentProductCard__actions}>
          <Button
            {...buyProps}
            colorScheme="green"
            className={styles.agentProductCard__addToCart}
            disabled={!cartProduct || !offer}
            style={
              {
                width: '100%',
                '--fs-button-padding': '0.5rem 0.75rem',
                '--fs-button-height': '2.25rem',
                '--fs-button-text-size': '0.6875rem',
              } as CSSProperties
            }
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              event.stopPropagation()
              buyProps.onClick?.(event as React.MouseEvent<HTMLButtonElement>)
            }}
          >
            Add to cart
          </Button>
          {onAskAbout && (
            <button
              type="button"
              className={styles.agentProductCard__ask}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onAskAbout(product)
              }}
            >
              Ask for more info
            </button>
          )}
        </div>
      )}
    </div>
  )

  if (variant === 'shelf') {
    return (
      <article className={styles.agentProductCard} data-variant="shelf">
        {href ? (
          <NextLink
            className={styles.agentProductCard__mediaLink}
            href={href}
            prefetch={false}
            aria-label={product.name}
          >
            {media}
          </NextLink>
        ) : (
          media
        )}
        {body}
      </article>
    )
  }

  const content = (
    <>
      {media}
      {body}
    </>
  )

  return href ? (
    <NextLink className={styles.agentProductCard} href={href} prefetch={false}>
      {content}
    </NextLink>
  ) : (
    <article className={styles.agentProductCard} data-disabled>
      {content}
    </article>
  )
}
