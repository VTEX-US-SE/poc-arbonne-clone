import Link from '../Link/Link'
import styles from './MobileTabItem.module.scss'
import type { MobileTabItemProps } from './MobileTabItem.types'

/**
 * One icon-over-label entry in the mobile bottom tab bar. Renders as a
 * button when the parent supplies `onActivate` (menu and modal entries)
 * and as a plain link otherwise.
 */
export default function MobileTabItem({
  item,
  onActivate,
}: MobileTabItemProps) {
  const content = (
    <>
      {item.icon && (
        <img className={styles.mobileTabItem__icon} src={item.icon} alt="" />
      )}
      <span>{item.label}</span>
    </>
  )

  if (onActivate) {
    return (
      <button
        type="button"
        className={styles.mobileTabItem}
        onClick={onActivate}
      >
        {content}
      </button>
    )
  }

  return (
    <Link className={styles.mobileTabItem} href={item.url}>
      {content}
    </Link>
  )
}
