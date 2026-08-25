import { getAgentMessages, sendAgentMessage } from './agentChat'
import { addComposedSet, type ComposedSetInput } from './composedSet'
import { addRegistration, type RegistrationInput } from './registration'
import { parseAttachment, type RawAttachment } from './parseComposition'
import { sponsorByArbonneId } from './sponsor'

interface AssemblyItemRoot {
  skuId: string
}

interface SkuRoot {
  attachments?: RawAttachment[]
}

interface ResolverContext {
  loaders: {
    skuLoader: { load: (key: string) => Promise<unknown> }
  }
}

const resolvers = {
  Query: {
    arbAgentMessages: (_root: unknown, { urn }: { urn: string }) =>
      getAgentMessages(urn),
  },

  StoreProduct: {
    assemblyOptions: (root: SkuRoot) =>
      (root.attachments ?? [])
        .map((attachment) => {
          const groups = parseAttachment(attachment)

          if (groups.length === 0) {
            return null
          }

          return {
            id: attachment.name ?? String(attachment.id ?? ''),
            name: attachment.name ?? '',
            required: attachment.required ?? attachment.isRequired ?? false,
            groups,
          }
        })
        .filter(Boolean),
  },

  Query: {
    arbSponsor: (_root: unknown, { arbonneId }: { arbonneId: string }) =>
      sponsorByArbonneId(arbonneId),
  },

  Mutation: {
    arbSendAgentMessage: (
      _root: unknown,
      {
        from,
        message,
        contactName,
      }: { from: string; message: string; contactName?: string }
    ) => sendAgentMessage({ from, message, contactName }),

    arbAddComposedSet: (_root: unknown, { data }: { data: ComposedSetInput }) =>
      addComposedSet(data),

    arbAddRegistration: (
      _root: unknown,
      { data }: { data: RegistrationInput }
    ) => addRegistration(data),
  },

  ArbAssemblyItem: {
    product: async (
      { skuId }: AssemblyItemRoot,
      _args: unknown,
      ctx: ResolverContext
    ) => {
      try {
        return await ctx.loaders.skuLoader.load(skuId)
      } catch {
        return null
      }
    },
  },
}

export default resolvers
