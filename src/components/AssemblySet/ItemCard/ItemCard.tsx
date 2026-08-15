import { isInStock } from '../../../utils/assemblySet'
import Stepper from '../Stepper/Stepper'

import styles from './ItemCard.module.scss'
import type { ItemCardProps } from './ItemCard.types'

/** One child product of a group, with its own min/max-clamped stepper. */
export default function ItemCard({
  item,
  quantity,
  groupRemaining,
  onChange,
}: ItemCardProps) {
  const { product } = item

  if (!product) {
    return null
  }

  const image = product.image?.[0]
  const outOfStock = !isInStock(item)

  return (
    <li className={styles.itemCard}>
      {image && (
        <img
          className={styles.itemCard__image}
          src={image.url}
          alt={image.alternateName ?? product.name}
          loading="lazy"
        />
      )}
      <div className={styles.itemCard__body}>
        <p className={styles.itemCard__name}>{product.name}</p>

        {outOfStock ? (
          <p className={styles.itemCard__outOfStock}>Out of Stock</p>
        ) : (
          <Stepper
            value={quantity}
            announce
            canDecrease={quantity > item.minQuantity}
            canIncrease={quantity < item.maxQuantity && groupRemaining > 0}
            decreaseLabel={`Remove one ${product.name}`}
            increaseLabel={`Add one ${product.name}`}
            onDecrease={() => onChange(item.skuId, quantity - 1)}
            onIncrease={() => onChange(item.skuId, quantity + 1)}
          />
        )}
      </div>
    </li>
  )
}
