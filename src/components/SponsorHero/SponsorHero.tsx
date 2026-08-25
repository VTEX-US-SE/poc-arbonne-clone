import useSponsor from '../../hooks/useSponsor'
import SponsorHeroSkeleton from './SponsorHeroSkeleton'
import styles from './SponsorHero.module.scss'

/**
 * A consultant's storefront header: their banner, avatar and name.
 *
 * The consultant comes from `?sponsor=<arbonneId>` rather than from the CMS,
 * so one landing page serves every consultant -- copy included. Renders nothing
 * when the parameter is absent or names no one, so the rest of the page still
 * stands on its own.
 */
export default function SponsorHero() {
  const { sponsor, loading } = useSponsor()

  if (loading) {
    return <SponsorHeroSkeleton />
  }

  if (!sponsor) {
    return null
  }

  const {
    displayName,
    displayDescription,
    profilePicture,
    desktopImage,
    mobileImage,
  } = sponsor
  const desktopSrc = desktopImage ?? mobileImage
  const mobileSrc = mobileImage ?? desktopImage

  return (
    <section className={styles.sponsorHero}>
      <div className={styles.sponsorHero__card}>
        {mobileSrc && (
          <picture className={styles.sponsorHero__banner}>
            {desktopSrc && (
              <source media="(min-width: 64rem)" srcSet={desktopSrc} />
            )}
            <img src={mobileSrc} alt="" />
          </picture>
        )}

        <div className={styles.sponsorHero__body}>
          <div className={styles.sponsorHero__avatar}>
            {profilePicture && <img src={profilePicture} alt="" />}
          </div>

          {displayName && (
            <h1 className={styles.sponsorHero__name}>{displayName}</h1>
          )}

          {displayDescription && (
            <p className={styles.sponsorHero__greeting}>{displayDescription}</p>
          )}
        </div>
      </div>
    </section>
  )
}
