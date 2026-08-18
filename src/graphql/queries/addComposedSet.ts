import { gql } from '@generated'

/**
 * Composes a customisable set into the cart. The orderForm work happens in
 * `graphql/vtex/resolvers/composedSet.ts` so the whole set lands atomically,
 * and so the call goes through `/api/graphql` -- a real route in local dev,
 * unlike `/api/checkout/*`.
 */
export const addComposedSetMutation = gql(`
  mutation ArbAddComposedSet($data: ArbComposedSetInput!) {
    arbAddComposedSet(data: $data) {
      orderFormId
      value
      messages
    }
  }
`)
