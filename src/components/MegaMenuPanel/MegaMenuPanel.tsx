import { Icon } from '@faststore/ui'

import { slugHref } from '../../utils/href'
import Button from '../Button/Button'
import styles from './MegaMenuPanel.module.scss'
import type { MegaMenuPanelProps } from './MegaMenuPanel.types'

/**
 * Renders one top-level megaMenu item's children. Figma has two shapes
 * sharing the same 3-level tree: "rich" panels where each child is a
 * column header with its own sub-links (Nutrition, Skincare...), and
 * "simple" panels where the children are themselves the clickable links
 * (Healthy Living, Join Now, About Us) -- distinguished here by whether
 * any child has its own `menu`, not by a variant prop.
 */
export default function MegaMenuPanel({
  columns,
  banner,
  onClose,
}: MegaMenuPanelProps) {
  const isSimple = columns.every((column) => !column.menu?.length)

  return (
    <div className={styles.megaMenuPanel}>
      <button
        type="button"
        className={styles.megaMenuPanel__close}
        onClick={onClose}
        aria-label="Close menu"
      >
        <Icon name="X" weight="bold" width={20} height={20} />
      </button>

      {isSimple ? (
        <ul
          className={`${styles.megaMenuPanel__linkList} ${styles.megaMenuPanel__simpleList}`}
        >
          {columns.map((link, index) => (
            <li key={link.slug ?? index}>
              <a
                className={styles.megaMenuPanel__link}
                href={slugHref(link.slug)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.megaMenuPanel__columns}>
          {columns.map((column, index) => (
            <div
              key={column.slug ?? column.name ?? index}
              className={styles.megaMenuPanel__column}
            >
              <p className={styles.megaMenuPanel__columnTitle}>{column.name}</p>
              <ul className={styles.megaMenuPanel__linkList}>
                {column.menu?.map((link, linkIndex) => (
                  <li key={link.slug ?? linkIndex}>
                    <a
                      className={styles.megaMenuPanel__link}
                      href={slugHref(link.slug)}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {banner && (
        <div className={styles.megaMenuPanel__banner}>
          {banner.image && (
            <img
              className={styles.megaMenuPanel__bannerImage}
              src={banner.image}
              alt={banner.imageAlt ?? ''}
            />
          )}
          <div className={styles.megaMenuPanel__bannerContent}>
            {banner.eyebrow && (
              <p className={styles.megaMenuPanel__bannerEyebrow}>
                {banner.eyebrow}
              </p>
            )}
            {banner.headline && (
              <p className={styles.megaMenuPanel__bannerHeadline}>
                {banner.headline}
              </p>
            )}
            {banner.subtitle && (
              <p className={styles.megaMenuPanel__bannerSubtitle}>
                {banner.subtitle}
              </p>
            )}
            {banner.text && (
              <p className={styles.megaMenuPanel__bannerText}>{banner.text}</p>
            )}
            {banner.ctaText && banner.ctaUrl && (
              <Button
                className={styles.megaMenuPanel__bannerCta}
                href={banner.ctaUrl}
                colorScheme="greenLink"
              >
                {banner.ctaText}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
