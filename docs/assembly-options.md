# Assembly options — customisable sets

How "Build Your Best ..." works on this store, end to end: catalog attachment,
storefront builder, and the Checkout call that binds a composed set to its
parent.

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

| Source             | Shape                                                       |
| ------------------ | ----------------------------------------------------------- |
| Intelligent Search | `attachments[].fields[].domain_values` (nested, snake_case) |
| Legacy catalog     | `attachments[].domainValues` — a JSON **string**            |

`@faststore/api`'s TypeScript type declares only the legacy shape while its
client calls Intelligent Search, so following the type gives `undefined`.
`parseComposition.ts` accepts both.

## What we built

| File                                                        | Purpose                                        |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `src/graphql/vtex/typeDefs/assemblyOptions.graphql`         | `extend type StoreProduct { assemblyOptions }` |
| `src/graphql/vtex/resolvers/parseComposition.ts`            | composition parser, both shapes                |
| `src/graphql/vtex/resolvers/index.ts`                       | resolver; hydrates children via `skuLoader`    |
| `src/components/AssemblySet/`                               | the picker section                             |
| `cms/faststore/components/cms_component__assemblyset.jsonc` | CMS schema                                     |

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

| Token        | Value                         |
| ------------ | ----------------------------- |
| `{max}`      | most items the group allows   |
| `{min}`      | fewest the group requires     |
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
2. **Associate it with the parent SKU** — the app does _not_ do this. Catalog →
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
- Attachment `Id 4`, `spike-manual-composition` — a hand-built attachment kept
  as a reproduction case while composition was thought to be unsupported. That
  is resolved, so this one can be deleted.
- Parent SKU `1657` is priced at `0.01`; see [Parent price](#parent-price).
- The attachment is named "Build Your Best **Skin**" and its group "Skincare
  items", while SKU `1657` is the **Nutrition** set. Either it is shared across
  sets or `1657` is wired to the wrong one — worth checking in Admin, since the
  storefront reads the group name into the builder's headline.

## Adding a set to the cart

Resolved. The section that stood here recorded this as blocked on VTEX; two of
its findings were wrong.

**The `assemblyId` is `{attachmentName}_{groupName}`,** not the attachment name.
Read it off the orderForm rather than composing it — the shape is VTEX's:

```
itemMetadata.items[].assemblyOptions[]
  id:   vtex.assembly-option.Build Your Best Skin_Skincare items   ← what Checkout wants
  name: vtex.assembly-option.Build Your Best Skin
```

Trying variations of `name` is what produced the earlier `CHK0172`. The old note
that `itemMetadata.items[0].assemblyOptions` came back empty no longer holds
either — it returns the full composition, so something also changed server-side
(a reindex, or the no-op SKU Save this page already recommends).

The flow, per copy of a set:

```
POST /api/checkout/pub/orderForm/{id}/items
     {"orderItems": [{"id": parentSku, "quantity": 1, "seller": "1"}]}

POST /api/checkout/pub/orderForm/{id}/items/{index}/assemblyOptions/{assemblyId}
     {"composition": {"items": [{id, quantity, seller}]}, "inputValues": {}}
```

Children come back carrying `parentItemIndex`, so Checkout charges the parent's
own price on top and set-level promotions can key on the binding.

### One parent line per copy

Not one parent with scaled children. Both alternatives were tested and fail:

| Attempt                   | Result                                                |
| ------------------------- | ----------------------------------------------------- |
| parent qty 3, child qty 2 | `400 CHK0023 Invalid quantity for item`               |
| parent qty 3, child qty 6 | `200` but `itemMaxQuantityLimitReached`, clamped to 4 |

Composition quantities must be a multiple of the parent quantity, and per-item
and per-group maxima are **absolute per line, not per set**. Adding the parent
again produces a second, independent line once the first is composed — which is
what makes N copies expressible at all. The calls are sequential because copy
N's parent index depends on the lines copy N-1 added, so `MAX_QTY` (10) caps
what one click can trigger.

### Where it lives

Server-side, behind the `arbAddComposedSet` mutation
(`src/graphql/vtex/resolvers/composedSet.ts`), not in the browser. Two reasons:
a dropped connection mid-sequence would otherwise strand orphan parent lines in
the shopper's cart, and `/api/checkout/*` has no route in local dev while
`/api/graphql` does. The client calls it through `hooks/useAddComposedSet`.

Checkout validates the composition against the catalog, so the public endpoints
are not a hole: injecting a SKU absent from the composition returns
`400 CHK0172 Invalid item assembly`, quantities are clamped to the declared
maxima, and prices never come from the payload.

### Parent price

The parent carries a real (small) price and Checkout charges it on top of the
children, so it belongs in any total the storefront displays — the builder's
"Your Price" adds it. A price of exactly `0` makes the SKU unavailable and, with
`hideUnavailableItems: true`, drops it from search and PLP; the account uses
`0.01` instead.

### Out of stock children

Stock is enforced in one place: `initialQuantities`, which seeds an unavailable
child at 0 rather than at its declared `initialQuantity`.

It has to be there because four things read the same `quantities` map — the
min/max gate, the progress bar, the displayed price and the composition sent to
Checkout. Filtering only in the last of those (as `setSelection` does) left the
first three counting an item that would never be bought: the CTA enabled on an
under-filled set, and the price shown was higher than the price charged. An
out-of-stock card also hides its stepper, so the shopper could not have cleared
the seed themselves.

What is **not** handled: if enough children go out of stock that the in-stock
pool falls below the group minimum, the gate can never be satisfied and the CTA
stays disabled with no explanation. Today the minimum is 1, so it cannot arise.

### Still open

FastStore's cart model has no concept of an assembly binding — its `CartItem`
fragment carries no `parentItemIndex` or `parentAssemblyBinding`, and
`validateCart` round-trips the whole cart from the client store. So the cart
sidebar cannot represent a set, and composing must not be followed by a
FastStore cart validation that would flatten the binding. `SetAddedModal`
confirms the set instead, then hands over to Checkout.
