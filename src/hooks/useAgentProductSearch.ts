import { useEffect, useMemo, useState } from 'react'
import { request } from 'src/sdk/graphql/request'
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

const MAX_TERMS = 4

function mergeProducts(current: AgentProduct[], incoming: AgentProduct[]) {
  const merged = new Map<string, AgentProduct>()

  for (const product of [...current, ...incoming]) {
    merged.set(`${product.sku}-${product.seller}`, product)
  }

  return Array.from(merged.values())
}

export default function useAgentProductSearch(terms: string | string[] | null | undefined) {
  const { channel, locale } = useSession()
  const normalized = useMemo(() => {
    const list = Array.isArray(terms) ? terms : terms ? [terms] : []
    const trimmed = list.map((term) => term.trim()).filter(Boolean)
    const unique: string[] = []

    for (const term of trimmed) {
      if (!unique.includes(term)) {
        unique.push(term)
      }
    }

    return unique.slice(0, MAX_TERMS)
  }, [terms])

  const primary = normalized[0] ?? ''
  const variables = useMemo(
    () => ({
      term: primary,
      selectedFacets: [
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale },
      ],
    }),
    [channel, locale, primary]
  )

  const { data } = useQuery<
    AgentProductSearchData,
    AgentProductSearchVariables
  >(agentProductSearchQuery, variables, {
    doNotRun: !primary,
  })

  const primaryProducts = useMemo<AgentProduct[]>(() => {
    const nodes = data?.search?.suggestions?.products ?? []

    return nodes
      .map((node) => (node ? toAgentProductFromSearch(node) : null))
      .filter((product): product is AgentProduct => product !== null)
  }, [data])

  const [extraProducts, setExtraProducts] = useState<AgentProduct[]>([])
  const extraKey = normalized.slice(1).join('|')

  useEffect(() => {
    const extraTerms = normalized.slice(1)

    if (!extraTerms.length) {
      setExtraProducts([])
      return
    }

    let cancelled = false

    async function loadExtras() {
      const facets = [
        { key: 'channel', value: channel ?? '' },
        { key: 'locale', value: locale ?? '' },
      ]
      let merged: AgentProduct[] = []

      for (const term of extraTerms) {
        const result = await request<
          AgentProductSearchData,
          AgentProductSearchVariables
        >(agentProductSearchQuery, { term, selectedFacets: facets })

        const nodes = result?.search?.suggestions?.products ?? []
        const products = nodes
          .map((node) => (node ? toAgentProductFromSearch(node) : null))
          .filter((product): product is AgentProduct => product !== null)

        merged = mergeProducts(merged, products)
      }

      if (!cancelled) {
        setExtraProducts(merged)
      }
    }

    void loadExtras()

    return () => {
      cancelled = true
    }
  }, [channel, extraKey, locale, normalized])

  return useMemo(
    () => mergeProducts(primaryProducts, extraProducts),
    [extraProducts, primaryProducts]
  )
}
