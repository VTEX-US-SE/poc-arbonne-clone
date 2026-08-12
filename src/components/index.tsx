import CategoryHero from './CategoryHero/CategoryHero'
import Footer from './Footer/Footer'
import Header from './Header/Header'
import HeroBanner from './HeroBanner/HeroBanner'
import ImageOverlayCard from './ImageOverlayCard/ImageOverlayCard'
import ImageTextSplit from './ImageTextSplit/ImageTextSplit'
import LegalDisclaimer from './LegalDisclaimer/LegalDisclaimer'
import ProductDetails from './ProductDetails/ProductDetails'
import ProductShowcases from './ProductShowcases/ProductShowcases'
import SectionHeader from './SectionHeader/SectionHeader'
import TwoColumnCards from './TwoColumnCards/TwoColumnCards'

/**
 * CMS section registry. Each key must match the `$componentKey` of a schema
 * in `cms/faststore/components`, and this file must stay at
 * `src/components/index.tsx` -- the CLI copies `src/` one level deeper, so a
 * nested registry is silently ignored.
 */
export default {
  HeroBanner,
  CategoryHero,
  ImageTextSplit,
  ImageOverlayCard,
  SectionHeader,
  TwoColumnCards,
  ProductShowcases,
  ProductDetails,
  LegalDisclaimer,
  Footer,
  Header,
}
