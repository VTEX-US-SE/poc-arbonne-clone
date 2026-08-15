import Link from '../Link/Link'
import styles from './Footer.module.scss'
import type { FooterProps } from './Footer.types'

/**
 * Site-wide footer: link columns + social icons, a centered compliance
 * badge, and a bottom legal bar. Social icons render nested inside the
 * last column (Figma has them sitting directly under it, not as their
 * own 5th column). Registered as a normal CMS section (like every other
 * custom component here) and dropped into the "Global Footer Sections"
 * singleton content instance in Admin -- FastStore's built-in Footer has
 * no override slot, but that singleton's `sections` accepts any
 * registered component, so this one replaces it there instead.
 */
export default function Footer({
  linkColumns = [],
  socialLinks = [],
  bCorpBadgeImage,
  bCorpBadgeAlt = 'Certified B Corporation',
  legalLinks = [],
  copyrightText,
}: FooterProps) {
  return (
    <footer className={styles.footer} data-arb-footer>
      <div className={styles.footer__columns}>
        {linkColumns.map((column, i) => (
          <div key={i} className={styles.footer__column}>
            {column.title && (
              <p className={styles.footer__columnTitle}>{column.title}</p>
            )}
            <ul className={styles.footer__linkList}>
              {column.links?.map((link, j) => (
                <li key={j}>
                  <Link className={styles.footer__link} href={link.url}>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
            {i === linkColumns.length - 1 && socialLinks.length > 0 && (
              <div className={styles.footer__social}>
                {socialLinks.map((social, j) => (
                  <Link
                    key={j}
                    className={styles.footer__socialLink}
                    href={social.url}
                    aria-label={social.alt}
                  >
                    {/* `alt=""`: the link already carries the name via
                        `aria-label`, so a filled alt double-announces. */}
                    {social.icon && <img src={social.icon} alt="" />}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {bCorpBadgeImage && (
        <img
          className={styles.footer__badge}
          src={bCorpBadgeImage}
          alt={bCorpBadgeAlt}
        />
      )}
      <div className={styles.footer__legal}>
        {legalLinks.map((link, i) => (
          <Link key={i} className={styles.footer__legalLink} href={link.url}>
            {link.text}
          </Link>
        ))}
        {copyrightText && (
          <span className={styles.footer__copyright}>{copyrightText}</span>
        )}
      </div>
    </footer>
  )
}
