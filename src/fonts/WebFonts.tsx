/* eslint-disable @next/next/no-page-custom-font */

/**
 * Brand webfonts, as a single render-blocking request.
 *
 * There were two stylesheet links, and the first pulled the whole Inter family
 * purely to satisfy `--fs-text-face-body`. That token now points at
 * `--arb-font-body`, so Inter is gone and its request with it.
 *
 * Nunito Sans carries weight 600 because it is what core's
 * `--fs-text-weight-semibold` resolves to, and it now serves every platform
 * surface as well as our own.
 */
function WebFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lora:wght@400&family=Nunito:wght@800;900&family=Nunito+Sans:wght@400;600;700;800&display=swap"
      />
    </>
  )
}

export default WebFonts
