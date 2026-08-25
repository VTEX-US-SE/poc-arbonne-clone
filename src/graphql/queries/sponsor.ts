import { gql } from '@generated'

/**
 * The consultant behind `?sponsor=`. Resolved server-side, so the storefront
 * never talks to Master Data directly and the field whitelist lives on the
 * server rather than in a URL the browser could edit.
 */
export const query = gql(`
  query ArbSponsorQuery($arbonneId: String!) {
    arbSponsor(arbonneId: $arbonneId) {
      displayName
      displayDescription
      profilePicture
      desktopImage
      mobileImage
      displayCollection
    }
  }
`)
