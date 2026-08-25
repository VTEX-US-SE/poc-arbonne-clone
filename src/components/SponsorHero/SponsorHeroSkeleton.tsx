import Skeleton from '../Skeleton/Skeleton'

import styles from './SponsorHero.module.scss'

/**
 * Placeholder occupying the same box as a `SponsorHero`, reusing that
 * component's own classes so the card keeps its shape while the consultant
 * loads -- including the avatar's overlap of the banner edge.
 */
export default function SponsorHeroSkeleton() {
  return (
    <section className={styles.sponsorHero}>
      <div className={styles.sponsorHero__card}>
        <div className={styles.sponsorHero__bannerPlaceholder}>
          <Skeleton width="100%" height="100%" />
        </div>

        <div className={styles.sponsorHero__body}>
          <div className={styles.sponsorHero__avatar}>
            <Skeleton width="100%" height="100%" border="circle" />
          </div>

          <div className={styles.sponsorHero__name}>
            <Skeleton width="55%" height="2.25rem" />
          </div>

          <div className={styles.sponsorHero__greeting}>
            <Skeleton count={2} width={['100%', '70%']} height="1.25rem" />
          </div>
        </div>
      </div>
    </section>
  )
}
