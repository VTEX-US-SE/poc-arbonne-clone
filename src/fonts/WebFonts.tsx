/**
 * Preloads the two faces that render above the fold.
 *
 * The families themselves are declared in `src/themes/fonts.scss` and served
 * from our own origin, so there is no stylesheet request here and no
 * `fonts.googleapis.com` / `fonts.gstatic.com` preconnect to go with it.
 *
 * Only Nunito Sans and Bebas Neue are preloaded -- the header, hero copy and
 * hero headline. Nunito and Lora load on demand, since preloading a face the
 * first screen never paints just competes with the ones it does.
 *
 * `crossOrigin` is required even same-origin: fonts are always fetched in CORS
 * mode, and without it the preload is discarded and fetched a second time.
 */
function WebFonts() {
  return (
    <>
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/fonts/nunito-sans-var.woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/fonts/bebas-neue-400.woff2"
        crossOrigin="anonymous"
      />
    </>
  )
}

export default WebFonts
