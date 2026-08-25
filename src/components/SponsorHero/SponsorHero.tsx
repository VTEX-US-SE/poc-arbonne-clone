import useSponsor from '../../hooks/useSponsor'
import Button from '../Button/Button'
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
  const { sponsor, loading, notFound } = useSponsor()

  if (loading) {
    return <SponsorHeroSkeleton />
  }

  // A link to a consultant who is not there. Says so, rather than quietly
  // rendering the page as if no consultant had been asked for.
  if (notFound) {
    return (
      <section className={styles.sponsorHero}>
        <div className={styles.sponsorHero__card}>
          <div className={styles.sponsorHero__notFound}>
            <h1 className={styles.sponsorHero__name}>Consultant not found</h1>
            <p className={styles.sponsorHero__greeting}>
              This link does not match any Arbonne Independant Consultant. The
              link may be out of date, or the consultant may no longer be
              active.
            </p>
            <div className={styles.sponsorHero__notFoundActions}>
              <Button colorScheme="green" href="/">
                CONTINUE TO ARBONNE
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
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
