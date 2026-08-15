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

  ArbAssemblyItem: {
    product: async (
      { skuId }: AssemblyItemRoot,
      _args: unknown,
      ctx: ResolverContext
    ) => {
      try {
        return await ctx.loaders.skuLoader.load(skuId)
      } catch {
        // A child SKU can be delisted after the composition was written. One
        // missing child must not fail the whole set -- skuLoader throws on any
        // unresolved id, so swallow it and let the UI hide that card.
        return null
      }
    },
  },
}

export default resolvers
