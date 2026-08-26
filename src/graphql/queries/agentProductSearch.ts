import { gql } from '@generated'

export const agentProductSearchQuery = gql(`
  query AgentProductSearch(
    $term: String!
    $selectedFacets: [IStoreSelectedFacet!]
  ) {
    search(first: 8, term: $term, selectedFacets: $selectedFacets) {
      suggestions {
        products {
          slug
          sku
          name
          image {
            url
          }
          offers {
            lowPrice
            offers {
              seller {
                identifier
              }
            }
          }
        }
      }
    }
  }
`)
