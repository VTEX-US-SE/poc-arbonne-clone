import type { ArbSponsorOfRecordQueryQuery } from '@generated/graphql'
import { useQuery } from 'src/sdk/graphql/useQuery'

import { query } from '../graphql/queries/sponsorOfRecord'

/**
 * The consultant this shopper is already bound to, from their own `CL` record.
 *
 * Takes no argument -- the resolver identifies the shopper from their auth
 * cookie, so there is nothing for the browser to name. Signed-out shoppers get
 * `null`, which is why the caller decides whether to run it at all.
 */
export default function useSponsorOfRecord({ doNotRun = false } = {}) {
  const { data, isLoading } = useQuery<ArbSponsorOfRecordQueryQuery>(
    query,
    {},
    { doNotRun }
  )

  return {
    sponsor: data?.arbSponsorOfRecord ?? null,
    loading: !doNotRun && isLoading,
  }
}
