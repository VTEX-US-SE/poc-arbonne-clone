import { useEffect, useRef } from 'react'
import { RichText } from 'src/components/ui/RichText'

import PurchaseCta from '../PurchaseCta/PurchaseCta'
import styles from './ProductDetails.module.scss'
import type { PurchaseOptionsProps } from './ProductDetails.types'

/**
 * One-time vs. ReplenishMe radio group, each option revealing its own
 * add-to-cart row. The selection and the chosen frequency live in the PDP,
 * which folds them into the subscription attachment carried by `buyProps` --
 * this component only renders them.
 *
 * With no cadences the SKU has no ReplenishMe plan, so only the one-time row
 * renders and the group collapses to a single option.
 *
 * Also the anchor for the sticky bar: once this group scrolls off the top,
 * `onStickyChange` tells the PDP to float a compact copy of the CTA.
 */
export default function PurchaseOptions({
  oneTimeLabel = 'One-time purchase',
  replenishTitle,
  replenishText,
  replenishFrequencies,
  quantityLabel,
  addToCartLabel,
  replenishCtaLabel = 'Add to ReplenishMe',
  buyProps,
  disabled,
  loading,
  quantity,
  onQuantityChange,
  onStickyChange,
  ctaHref,
  purchaseOption,
  onPurchaseOptionChange,
  frequency,
  onFrequencyChange,
}: PurchaseOptionsProps) {
  const optionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = optionsRef.current

    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) =>
        onStickyChange(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        ),
      { threshold: 0 }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [onStickyChange])

  const canReplenish = replenishFrequencies.length > 0
  const frequencyOptions = Object.fromEntries(
    replenishFrequencies.map(({ value, label }) => [value, label])
  )

  return (
    <div
      ref={optionsRef}
      className={styles.productDetails__options}
      role="radiogroup"
      aria-label="Purchase options"
    >
      <div
        className={styles.productDetails__option}
        data-selected={purchaseOption === 'oneTime'}
      >
        <button
          type="button"
          role="radio"
          aria-checked={purchaseOption === 'oneTime'}
          className={styles.productDetails__optionLabel}
          onClick={() => onPurchaseOptionChange('oneTime')}
        >
          {oneTimeLabel}
        </button>

        {purchaseOption === 'oneTime' && (
          <PurchaseCta
            className={styles.productDetails__cta}
            quantityLabel={quantityLabel}
            buttonLabel={addToCartLabel}
            buyProps={buyProps}
            disabled={disabled}
            loading={loading}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            href={ctaHref}
          />
        )}
      </div>

      {canReplenish && (
        <div
          className={styles.productDetails__option}
          data-selected={purchaseOption === 'replenish'}
        >
          <button
            type="button"
            role="radio"
            aria-checked={purchaseOption === 'replenish'}
            className={styles.productDetails__optionLabel}
            onClick={() => onPurchaseOptionChange('replenish')}
          >
            {replenishTitle}
          </button>

          {replenishText && (
            <RichText
              className={styles.productDetails__replenishText}
              content={replenishText}
            />
          )}

          {purchaseOption === 'replenish' && (
            <PurchaseCta
              className={styles.productDetails__cta}
              quantityLabel={quantityLabel}
              buttonLabel={replenishCtaLabel}
              buyProps={buyProps}
              disabled={disabled}
              loading={loading}
              quantity={quantity}
              onQuantityChange={onQuantityChange}
              href={ctaHref}
              frequencies={frequencyOptions}
              frequency={frequency}
              onFrequencyChange={onFrequencyChange}
            />
          )}
        </div>
      )}
    </div>
  )
}
