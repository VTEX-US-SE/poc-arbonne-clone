import { addComposedSet, type ComposedSetInput } from './composedSet'
import {
  addRegistration,
  addSkuToCart,
  type AddSkuInput,
  type RegistrationInput,
} from './registration'
import { parseAttachment, type RawAttachment } from './parseComposition'

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

  Mutation: {
    arbAddComposedSet: (_root: unknown, { data }: { data: ComposedSetInput }) =>
      addComposedSet(data),

    arbAddRegistration: (
      _root: unknown,
      { data }: { data: RegistrationInput }
    ) => addRegistration(data),

    arbAddSkuToCart: (_root: unknown, { data }: { data: AddSkuInput }) =>
      addSkuToCart(data),
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
