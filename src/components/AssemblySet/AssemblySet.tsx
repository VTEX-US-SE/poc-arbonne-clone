import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import type {
  ArbAssemblySetQueryQuery,
  ArbAssemblySetQueryQueryVariables,
} from '@generated/graphql'
import { useCart } from 'src/sdk/cart'
import { redirectToCheckout } from 'src/sdk/cart/redirectToCheckout'
import { useQuery } from 'src/sdk/graphql/useQuery'
import { useSession } from 'src/sdk/session'

import { query } from '../../graphql/queries/assemblySet'
import {
  bestOffer,
  groupTotal,
  isGroupSatisfied,
  parseQtyParam,
  setSelection,
  MAX_QTY,
  SET_PARAM,
  QTY_PARAM,
} from '../../utils/assemblySet'
import { addComposedSet } from '../../utils/assemblyCheckout'
import { slugHref } from '../../utils/href'
import Link from '../Link/Link'

import styles from './AssemblySet.module.scss'
import AssemblySetSkeleton from './AssemblySetSkeleton/AssemblySetSkeleton'
import type {
  AssemblyGroup,
  AssemblyOption,
  AssemblySetProps,
} from './AssemblySet.types'
import SetAddedModal from './SetAddedModal/SetAddedModal'
import SetGroup from './SetGroup/SetGroup'
import Stepper from './Stepper/Stepper'

/**
 * Customisable set builder ("Build Your Best ..."). Reads the VTEX assembly
 * option declared on the parent SKU, renders one card per eligible child, and
 * enforces the group's own min/max as the add-to-cart gate.
 *
 * The composition is catalog data, so adding or removing a product is an Admin
 * change -- nothing here is hardcoded per set.
 */
export default function AssemblySet({
  headline,
  hint,
  completeHint,
  pcDiscountPercent = 20,
  ctaLabel = 'ADD TO CART',
}: AssemblySetProps) {
  const { channel, locale } = useSession()
  const { id: orderFormId } = useCart()
  const router = useRouter()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [sets, setSets] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<{
    total: number
    notice?: string
    orderFormId: string
  } | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  const fromQuery = router.query[SET_PARAM]
  const setId = typeof fromQuery === 'string' ? fromQuery : ''
  const qtyFromQuery = router.query[QTY_PARAM]

  // `router.query` is empty until hydration on a statically generated page, so
  // the quantity the PDP passed arrives after the first render rather than being
  // available to `useState`'s initialiser.
  useEffect(() => {
    const parsed = parseQtyParam(qtyFromQuery)

    if (parsed) {
      setSets(parsed)
    }
  }, [qtyFromQuery])

  const variables = useMemo(
    () => ({
      locator: [
        { key: 'id', value: setId },
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale ?? '' },
      ],
    }),
    [setId, channel, locale]
  )

  const { data, isLoading } = useQuery<
    ArbAssemblySetQueryQuery,
    ArbAssemblySetQueryQueryVariables
  >(query, variables, {
    doNotRun: !router.isReady || !setId,
    revalidateOnMount: true,
  })
  const product = data?.product

  const groups = useMemo(
    () =>
      ((product?.assemblyOptions ?? []) as AssemblyOption[]).flatMap(
        (option) => option.groups
      ),
    [product]
  )

  useEffect(() => {
    setQuantities(
      Object.fromEntries(
        groups.flatMap((group) =>
          group.items.map((item) => [item.skuId, item.initialQuantity])
        )
      )
    )
  }, [groups])

  const selectedTotal = useMemo(
    () =>
      groups
        .flatMap((group) => group.items)
        .reduce((total, item) => {
          const quantity = quantities[item.skuId] ?? 0
          const offer = bestOffer(item)

          return offer ? total + offer.price * quantity : total
        }, 0),
    [groups, quantities]
  )

  // The parent SKU carries its own small price and Checkout charges it on top of
  // the children, so it belongs in every set total -- without it this panel
  // understates the cart by the parent price per set.
  const parentPrice = product?.offers?.offers?.[0]?.price ?? 0
  const yourPrice = (selectedTotal + parentPrice) * sets
  const pcPrice = yourPrice * (1 - pcDiscountPercent / 100)

  const formatAmount = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return (value: number) => formatter.format(value)
  }, [locale])

  const selection = useMemo(
    () => setSelection(groups, quantities),
    [groups, quantities]
  )

  /**
   * Composes the set on the orderForm rather than adding the children as loose
   * cart items: only Checkout can bind them to the parent, and only then is the
   * parent's own price charged and set-level promotions able to fire.
   */
  const onAddToCart = async () => {
    if (!product?.sku || selection.length === 0) {
      return
    }

    setAdding(true)
    setAddError(null)

    try {
      const orderForm = await addComposedSet({
        parentSku: product.sku,
        selection,
        sets,
        orderFormId: orderFormId || undefined,
      })

      setAdded({
        total: orderForm.value / 100,
        notice: orderForm.messages?.[0],
        orderFormId: orderForm.orderFormId,
      })
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : 'Could not add this set.'
      )
    } finally {
      setAdding(false)
    }
  }

  if (!router.isReady || (setId && isLoading)) {
    return <AssemblySetSkeleton />
  }

  if (groups.length === 0) {
    return null
  }

  const canAddToCart = groups.every((group) =>
    isGroupSatisfied(group, quantities)
  )

  const onChange = (group: AssemblyGroup) => (skuId: string, next: number) => {
    const item = group.items.find((candidate) => candidate.skuId === skuId)

    if (!item) {
      return
    }

    const clamped = Math.min(Math.max(next, item.minQuantity), item.maxQuantity)
    const others = groupTotal(group, quantities) - (quantities[skuId] ?? 0)
    const allowed = Math.min(clamped, group.maxQuantity - others)

    setQuantities((current) => ({ ...current, [skuId]: Math.max(allowed, 0) }))
  }

  const productImage = product?.image?.[0]

  return (
    <section className={styles.assemblySet} data-arb-assembly-set>
      <div className={styles.assemblySet__inner}>
        <aside className={styles.assemblySet__aside}>
          {productImage && (
            <img
              className={styles.assemblySet__asideImage}
              src={productImage.url}
              alt={productImage.alternateName ?? product?.name ?? ''}
            />
          )}
          <h1 className={styles.assemblySet__title}>{product?.name}</h1>
          <p className={styles.assemblySet__subtitle}>
            Customize Your {product?.name}
          </p>
        </aside>

        <div className={styles.assemblySet__panel}>
          {product?.slug && (
            <Link
              className={styles.assemblySet__back}
              href={slugHref(`${product.slug}/p`)}
            >
              <svg
                className={styles.assemblySet__backIcon}
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  d="M10 3 5 8l5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to {product.name}
            </Link>
          )}

          {groups.map((group) => (
            <SetGroup
              key={group.name}
              group={group}
              quantities={quantities}
              headline={headline}
              hint={hint}
              completeHint={completeHint}
              onChange={onChange(group)}
            />
          ))}

          <div className={styles.assemblySet__summary}>
            <h2 className={styles.assemblySet__summaryTitle}>
              Customization Details
            </h2>

            <div className={styles.assemblySet__row}>
              <span>Your Price</span>
              <strong className={styles.assemblySet__price}>
                {formatAmount(yourPrice)}
              </strong>
            </div>
            <div className={styles.assemblySet__row}>
              <span>PC Price</span>
              <span>{formatAmount(pcPrice)}</span>
            </div>
            <div className={styles.assemblySet__row}>
              <span>You Could Save</span>
              <span>{formatAmount(yourPrice - pcPrice)}</span>
            </div>

            <div className={styles.assemblySet__row}>
              <span>Quantity of Customized Sets</span>
              <Stepper
                value={sets}
                canDecrease={sets > 1}
                decreaseLabel="Fewer sets"
                increaseLabel="More sets"
                onDecrease={() => setSets((value) => Math.max(value - 1, 1))}
                canIncrease={sets < MAX_QTY}
                onIncrease={() =>
                  setSets((value) => Math.min(value + 1, MAX_QTY))
                }
              />
            </div>
          </div>

          <div className={styles.assemblySet__actions}>
            <button
              type="button"
              className={styles.assemblySet__cta}
              disabled={!canAddToCart || adding}
              onClick={onAddToCart}
            >
              {adding ? 'ADDING…' : ctaLabel}
            </button>

            {addError && (
              <p className={styles.assemblySet__error} role="alert">
                {addError}
              </p>
            )}
          </div>
        </div>
      </div>

      <SetAddedModal
        open={added !== null}
        setName={product?.name}
        sets={sets}
        lines={selection.map(({ skuId, quantity }) => ({
          name:
            groups
              .flatMap((group) => group.items)
              .find((item) => item.skuId === skuId)?.product?.name ?? skuId,
          quantity,
        }))}
        formattedTotal={added ? formatAmount(added.total) : undefined}
        notice={added?.notice}
        onKeepCustomizing={() => setAdded(null)}
        onCheckout={() => redirectToCheckout(added?.orderFormId)}
      />
    </section>
  )
}
