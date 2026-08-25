import { gql } from '@generated'

/**
 * The consultant this shopper is already bound to. No variables: the resolver
 * reads the auth cookie, so the browser cannot ask about anyone else.
 */
export const query = gql(`
  query ArbSponsorOfRecordQuery {
    arbSponsorOfRecord {
      arbonneId
      displayName
      displayDescription
      profilePicture
      desktopImage
      mobileImage
      displayCollection
    }
  }
`)
