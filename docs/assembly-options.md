# Assembly options — customisable sets

How "Build Your Best ..." works on this store, what is proven, and the one
thing still blocked.

## The model

A **parent SKU** priced at (or near) zero carries a catalog **attachment**
whose domain value is a composition string:

```
[1-4]#1[0-4][0];#4373[0-4][0];
 │     │  │    └ initial quantity
 │     │  └ per-SKU min–max
 │     └ child SKU id
 └ group min–max  ← the "select N" gate
```

Children carry the price; the parent's own price is **added** to the set total.
Discounts (the "10% off your set") are **not** part of this mechanism — they are
ordinary VTEX promotions.

Two different shapes come back for the same attachment, and which one you get
depends on the endpoint:

| Source | Shape |
| --- | --- |
| Intelligent Search | `attachments[].fields[].domain_values` (nested, snake_case) |
| Legacy catalog | `attachments[].domainValues` — a JSON **string** |

`@faststore/api`'s TypeScript type declares only the legacy shape while its
client calls Intelligent Search, so following the type gives `undefined`.
`parseComposition.ts` accepts both.

## What we built

| File | Purpose |
| --- | --- |
| `src/graphql/vtex/typeDefs/assemblyOptions.graphql` | `extend type StoreProduct { assemblyOptions }` |
| `src/graphql/vtex/resolvers/parseComposition.ts` | composition parser, both shapes |
| `src/graphql/vtex/resolvers/index.ts` | resolver; hydrates children via `skuLoader` |
| `src/components/AssemblySet/` | the picker section |
| `cms/faststore/components/cms_component__assemblyset.jsonc` | CMS schema |
| `scripts/check-composition.mjs` | parser self-check — `node scripts/check-composition.mjs` |

**One page serves every set.** A single `landingPage` at `/assembly-option`
carries the section, and the parent's **product id** arrives in the query
string:

```
/assembly-option?set=1657   Build Your Best Nutrition Set
/assembly-option?set=8013   Build Your Makeup Edit
```

Adding a new set needs no new page and no deploy — just a link with its id.

Because `router.query` is empty until hydration on a statically generated page,
the request is held (`doNotRun`) until the id resolves. With no `?set=`, the
section renders nothing.

The **Hint Text** CMS field supports three tokens, expanded per group from the
catalog composition so the copy never contradicts the rules:

| Token | Value |
| --- | --- |
| `{max}` | most items the group allows |
| `{min}` | fewest the group requires |
| `{selected}` | how many are currently chosen |

`Choose {max} products to unlock 10% off your set.` stays correct when the
composition changes in Admin. Unknown tokens are left as-is rather than
blanked, so a typo is visible instead of silent.

Everything else — which products are eligible, how many you must pick, per-item
limits — is catalog data. A SKU may carry several assembly options and each may
declare several groups; all groups render, and **every** group's min/max must be
satisfied before the set can be added.

Placement is a CMS decision. Moving the section to the PDP content type would
require no code change (it renders `null` when the product has no assembly
options), though it would need the slug to come from page context instead.

## Admin setup, in order

1. **Create the option** — Products → Assembly options. Name, group name, group
   min/max, member SKUs with their own min/max/initial. Leave the price table
   empty to use the sales-channel price.
2. **Associate it with the parent SKU** — the app does *not* do this. Catalog →
   Products and SKUs → SKU → **Customizations → Attachments**. Skipping this is
   silent: everything looks configured and nothing renders.
3. **Save the SKU** — the association alone does not trigger a reindex.
   Intelligent Search only picked it up after an otherwise no-op Save.
4. **Give the parent a non-zero price.** A price of 0 makes the product
   unavailable on the storefront. Keep it small; it adds to every set total.

Verify:

```bash
curl -s "https://arbonnepoc.vtexcommercestable.com.br/api/intelligent-search/v1/product-search/?locale=en-US&salesChannel=1&query=<set name>&count=1" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['products'][0]['items'][0]['attachments'])"
```

## Current state on `arbonnepoc`

- Attachment `Id 3`, `vtex.assembly-option.Build Your Best Skin`,
  `[1-4]#1[0-4][0];#4373[0-4][0];` — associated to SKU `1657`
  (`skuattachment Id 21`).
- Attachment `Id 4`, `spike-manual-composition` — a hand-built attachment in
  VTEX's documented syntax, kept as a reproduction case for the ticket below.
  Safe to delete once resolved.

## Blocked: Checkout does not register the assembly

Everything reaches the catalog, the legacy catalog API, and Intelligent Search.
Checkout alone refuses it:

```
GET  /api/checkout/pub/orderForm/{id}
     → itemMetadata.items[0].assemblyOptions: []

POST /api/checkout/pub/orderForm/{id}/items
     with `options: [...]` → silently ignored, no children, no message

POST /api/checkout/pub/orderForm/{id}/items/{index}/assemblyOptions/{assemblyId}
     {"composition": {"items": [{"id","quantity","seller"}]}, "inputValues": {}}
     → 400 CHK0172 "Assembly '<id>' was not found for this item"
```

That last endpoint is the correct one — the payload passes validation and fails
at lookup. The `options` array on the items POST is not supported here.

**Ruled out:** `assemblyId` spelling (5 forms), metadata cache (21 min of
polling plus an instant empty on a second SKU), parent price of 0, composition
trailing `;` (reproduced with attachment 4 in the documented syntax), and
`vtex.product-customizer` (a frontend-only app — no `node` or `graphql`
builder, so it cannot affect checkout).

**Open question for VTEX:** what registers an attachment as an assembly option
with Checkout? Their docs distinguish seller vs marketplace account behaviour
for assembly options at checkout, which is the remaining suspect.

Until that is answered, the Add to Cart button is inert. Wiring it is one
function against the endpoint above.
