import { gql } from '@generated'

/**
 * Adds the registration SKU to the cart. The Checkout work happens in
 * `graphql/vtex/resolvers/registration.ts` so the one-per-account guard is
 * server-side, and so the call goes through `/api/graphql` -- a real route in
 * local dev, unlike `/api/checkout/*`.
 */
export const addRegistrationMutation = gql(`
  mutation ArbAddRegistration($data: ArbRegistrationInput!) {
    arbAddRegistration(data: $data) {
      orderFormId
      value
      messages
    }
  }
`)
