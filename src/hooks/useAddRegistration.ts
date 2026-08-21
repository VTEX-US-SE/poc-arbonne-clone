import { useCallback, useState } from 'react'
import { request } from 'src/sdk/graphql/request'

import { addRegistrationMutation } from '../graphql/queries/addRegistration'

export interface RegistrationPayload {
  skuId: string
  customerType: string
  sponsorId: string
  birthDate?: string
  consultantComms: boolean
  textMarketing: boolean
  agreementVersion?: string
}

interface RegistrationVariables {
  data: RegistrationPayload & { orderFormId?: string }
}

interface RegistrationResponse {
  arbAddRegistration: {
    orderFormId: string
    value: number
    messages: string[]
  }
}

/**
 * Adds a registration SKU to the cart, with the pending and error state the
 * submit button needs. Mirrors `useAddComposedSet` -- a hook rather than a util
 * because it performs I/O.
 *
 * Resolves to the orderForm id on success and `null` on failure, so the caller
 * can redirect without also reading state that has not re-rendered yet.
 */
export default function useAddRegistration() {
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addRegistration = useCallback(
    async (payload: RegistrationPayload & { orderFormId?: string }) => {
      setAdding(true)
      setError(null)

      try {
        const response = await request<
          RegistrationResponse,
          RegistrationVariables
        >(addRegistrationMutation, { data: payload })
        const added = response?.arbAddRegistration

        if (!added) {
          throw new Error('Could not start your registration.')
        }

        return added.orderFormId
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not start your registration.'
        )

        return null
      } finally {
        setAdding(false)
      }
    },
    []
  )

  return { addRegistration, adding, error }
}
