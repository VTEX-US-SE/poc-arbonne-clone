import { useMemo } from 'react'
import { useSession } from 'src/sdk/session'
import { useQuery } from 'src/sdk/graphql/useQuery'

import { agentProductSearchQuery } from '../graphql/queries/agentProductSearch'
import type { AgentProduct } from '../components/BeautyConsultant/BeautyConsultant.types'
import { toAgentProductFromSearch } from '../utils/agentProductSearch'

interface AgentProductSearchData {
  search?: {
    suggestions?: {
      products?: Array<{
        slug?: string | null
        sku?: string | null
        name?: string | null
        image?: Array<{ url?: string | null } | null> | null
        offers?: {
          lowPrice?: number | null
          offers?: Array<{
            seller?: { identifier?: string | null } | null
          } | null> | null
        } | null
      } | null> | null
    } | null
  } | null
}

interface AgentProductSearchVariables {
  term: string
  selectedFacets: Array<{ key: string; value: string }>
}

export default function useAgentProductSearch(term: string | null | undefined) {
  const { channel, locale } = useSession()
  const clean = term?.trim() ?? ''

  const variables = useMemo(
    () => ({
      term: clean,
      selectedFacets: [
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale },
      ],
    }),
    [channel, clean, locale]
  )

  const { data } = useQuery<
    AgentProductSearchData,
    AgentProductSearchVariables
  >(agentProductSearchQuery, variables, {
    doNotRun: !clean,
  })

  return useMemo<AgentProduct[]>(() => {
    const nodes = data?.search?.suggestions?.products ?? []

    return nodes
      .map((node) => (node ? toAgentProductFromSearch(node) : null))
      .filter((product): product is AgentProduct => product !== null)
  }, [data])
}
