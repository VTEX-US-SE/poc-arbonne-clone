# Conversion priorities — replatform

Changes that affect revenue rather than code quality, ordered by expected
impact. Three kinds of item, labelled per section:

- **Fix** — a POC behaviour that will carry into production unless changed
  (items 1–3).
- **Gap** — something absent from the POC, and possibly from production too
  (item 4).
- **Protect** — a production problem the POC has already solved. No work
  needed beyond not losing it, and each is direct evidence for the replatform
  business case (items 5–6).
- **Add** — a platform capability neither site currently uses (item 7).

This is a different lens from [`ux-fixes.md`](./ux-fixes.md), which catalogues
correctness and accessibility work across the whole tree. Where the two overlap
it is noted inline — the items here are the subset worth arguing for on
commercial grounds, and several are things that page will tell you to fix for
other reasons anyway.

---

## 1. The mega menu is discoverable only by a 12px caret — **fix**

**Where:** `Header.tsx:131-153`, `Header.module.scss:162-186`

Each top-level nav item renders as two separate targets:

```tsx
<a href={slugHref(item.slug)}>{item.name}</a>              // navigates away
{item.menu?.length && <button …><Icon width={12}/></button>}  // opens the panel
```

The word — which is what people aim at — navigates straight to the category
page. The panel opens only from a 12×12px caret with `padding: 0`, so the hit
area is roughly 12px square. There is no hover open at all, and no `:hover`
styling on the item to suggest anything is there.

### Why it costs money

The mega-menu panel is merchandising real estate. It carries curated
subcategory links and, per `Header.types.ts:7-18`, a full promo banner —
image, eyebrow, headline, subtitle, body copy and a CTA. That is a
purpose-built campaign slot.

Almost nobody sees it. A user who wants "Skincare" clicks the word "Skincare",
lands on the category page, and never learns the panel exists. The curated
paths into subcategories and the promo banner are effectively dark inventory.

The secondary cost is navigational: the panel is the only place the
subcategory structure is exposed. Without it, users fall back to whatever
faceting the category page offers, which is a slower and worse path to a
product.

### What to do

Hover-intent open, with click preserved:

- Open on `mouseenter` of the whole `<li>`, not the caret, with a short open
  delay (~120ms) so a mouse crossing the nav doesn't strobe panels.
- Close on `mouseleave` with a longer delay (~250ms) so diagonal travel from
  the item down into the panel doesn't dismiss it mid-move. This is the part
  naive implementations get wrong and it is why they feel broken.
- Guard the whole thing behind `@media (hover: hover)` / a pointer check, so
  touch devices keep tap-to-open.
- Keep click as a toggle — for touch, for keyboard, and for users who click
  out of habit.
- Keep the caret as an affordance, but it stops being the only hit area.
- Add Escape and click-outside to close. `useOnClickOutside` is already used
  in `SearchBox.tsx:51`.
- Add a `:hover` treatment on the nav item so the row reads as interactive at
  all.

One more mechanism belongs to this item rather than to item 2, despite sharing
its trigger: `Header.tsx:59-63` force-closes the open panel whenever the scroll
threshold trips. The panel is ~350px tall, so a trackpad twitch while reading it
dismisses it. Even with hover-intent working perfectly, the panel stays
dismissable by accident until this guard goes, or is narrowed to real scroll
away from the header.

### How to measure

- Mega-panel open events per session, before and after.
- Share of category-page entries originating from the nav vs. other sources.
- Click-through on the panel's promo banner — currently near-zero by
  construction.
- Pages per session.

---

## 2. Navigation disappears below the fold — **fix**

**Where:** `Header.module.scss:94-99`, `Header.tsx:49-57`

The desktop nav row collapses to `max-height: 0` once `data-scrolled` is set.
The threshold logic is:

```ts
setIsScrolled((scrolled) => window.scrollY > (scrolled ? 10 : 80))
```

It sets at 80px and only clears below **10px**. In practice that is one-way:
once collapsed, the user must scroll to the absolute top of the page to get
navigation back.

So on every PLP and every PDP — every page anyone actually reads — there is no
category navigation on screen.

### Why it costs money

Arbonne's cross-sell is category-to-category: nutrition into skincare,
skincare into body. That journey requires the nav to be reachable from the
middle of a product page, which is exactly where it is not.

A user finishing a PDP has three options: the footer, the browser back button,
or leaving. Browse depth is suppressed structurally, on every session, for
every visitor — including the large share who arrive on a PDP directly from
search or paid social and have no practical route into the catalog at all.

This is worth separating from the mega-menu problem in item 1. They are
independent failures with independent fixes, and either one shipped alone still
leaves a real hole: fixing the menu without this means the improved menu is
unreachable from the pages where people spend their time, and fixing this
without the menu means a persistent nav that still hides its own contents.
Both need doing, and each is worth doing on its own merits.

Note the hysteresis itself is a good instinct. It is the 10px clear threshold
that makes the behaviour one-way.

### What to do

Options, in order of preference:

1. **Keep a compact sticky nav.** Smaller type, same items, always present.
   The row already animates via `max-height`/`opacity`, so this is a matter of
   what it animates _to_ rather than new machinery.
2. **Raise the clear threshold** to something a user reaches naturally (~40px)
   so an upward scroll restores it. Cheapest change, partial fix.
3. **Reveal on scroll-up** (the common pattern). More work, and it interacts
   with the sticky bars on the PDP — see `ux-fixes.md` §3.4.

Worth confirming against the production site before changing: this may be a
deliberate design decision carried over rather than an artefact.

### How to measure

- Pages per session.
- PDP → category/PLP transition rate.
- Exit rate on PDP and PLP.
- Scroll-depth-to-exit on PDP: if users are bouncing from deep in the page,
  they hit the end of the content with nowhere to go.

---

## 3. PLP add-to-cart is hidden behind hover — **fix**

**Where:** `ProductCard.module.scss:150-185`

Above 1024px the entire cart block — quantity selector and Add to Cart — is
`opacity: 0; visibility: hidden` until the card is hovered. It is also
positioned `top: 100%`, so it renders outside the card's own box.

This appears in `ux-fixes.md` as §1.5 and §2.4, where it is flagged for a
different reason. The commercial case is stronger than the accessibility one.

### Why it costs money

**Desktop:** grid add-to-cart is a conversion feature. Hiding it means every
purchase routes through a PDP round-trip, adding a page load (currently a full
reload — see `ux-fixes.md` §2.1) and an abandonment opportunity to every
transaction that could have been one click. This is directly measurable.

**Touch devices at 1024px and up** — iPad in landscape, Surface, most
convertibles — have no hover event. The media query is a bare
`@media (min-width: 64rem)` with no hover-capability guard, so on those devices
the card has **no buy control at all**. Not degraded: absent. Users must open
the PDP or leave.

`custom-theme.scss:185` already uses `@media (hover: hover)` for core's product
card, so the pattern was established in this codebase and simply not applied to
ours.

**Secondary:** the card scales to `transform: scale(1.12)` on hover against a
`--fs-spacing-3` grid gap (`ProductShowcases.module.scss:77`). A 12% scale
overlaps neighbouring cards, so sweeping the mouse across a grid produces
flicker as hover passes between them — noise on the exact surface where you
want users comparing products calmly.

### What to do

Show the cart block at all breakpoints. Mobile already does this — the hover
reveal lives inside the `min-width: 64rem` block, which means the two
breakpoints currently have different information architecture for no stated
reason.

Drop the scale, or reduce it to ~1.02 and add `transform` to the
`prefers-reduced-motion` reset at line 187, which currently disables the
transitions but not the transform.

If the reveal is kept for design reasons, the media query must at minimum
become `@media (min-width: 64rem) and (hover: hover)` — but the reveal buys
nothing and costs a purchase path on every device that cannot hover.

### How to measure

- PLP-originated add-to-cart rate, split by device class. Isolate ≥1024px
  touch devices specifically; that cohort should show a near-zero PLP
  add-to-cart rate today.
- Share of sessions with a PDP visit before add-to-cart — should fall.
- PLP → PDP → back-to-PLP loops, which is the shape of a user hunting for a
  buy button.

---

## 4. The PDP is missing its conversion furniture — **gap**

**Where:** `ProductDetails.tsx` — and, more to the point, nowhere in `src/`.

The custom PDP renders: gallery, title, size and reference code, price, Klarna
badge, purchase options, add-to-cart, description. Klarna is a genuine
conversion element and instalment messaging lifts AOV. It is the only one on
the page.

Verified absent from the entire repo:

### Reviews and ratings — nothing at all

Not a component, not a field, not a CMS schema, not a query. For beauty and
nutrition this is usually the strongest single on-page conversion driver, and
the absence is total.

This is also a data question, not just a front-end one: reviews have to come
from somewhere, be moderated, syndicate to product schema for rich snippets,
and survive the migration. It belongs in the replatform scope early, not as a
front-end task later.

### No variant / SKU selector

`custom-theme.scss:268-272` styles `[data-fs-sku-selector]`, so core's selector
exists in the platform. The custom `ProductDetails` does not render it.

If this component replaces core's PDP in production, shade and size selection
disappears. That is an architectural decision with direct revenue consequences
rather than a POC gap, and it is the item on this page most likely to ship
unnoticed.

### No cross-sell

No "complete the routine", no frequently-bought-together, no related products,
no recently viewed. For a brand whose catalog is built around regimens and
systems, the routine-completion module is close to free AOV — the product
relationships already exist in the merchandising.

### No trust or urgency block near the buy button

No shipping estimate, no delivery date, no returns or guarantee copy, no stock
level or low-stock signal. The B Corp badge is a real brand asset and it is in
the footer (`Footer.tsx:58-64`) — shown at the moment it can least influence a
decision, rather than beside the price.

### No image zoom

`ImageGallery` with `object-fit: contain` and a fixed height
(`ProductDetails.module.scss:42-44`). For skincare and cosmetics, texture and
ingredient detail is part of the sell.

### The description is an unstructured HTML blob

`ProductDetails.tsx:159-164` renders the raw catalog description through
`RichText`. Per the component's own docstring, that blob contains the benefit
bullets, "WHY IT'S DIFFERENT" and "GOOD FOR" — the actual selling copy — as
presumably `<p><strong>`.

The result is a PDP with an `<h1>` and then no headings at all. Nobody skims to
the selling copy, and it contributes nothing to search relevance or to
screen-reader navigation.

### What to do

For the replatform, in rough priority:

1. **Reviews.** Decide the source and migration path early — it gates the
   biggest single lift and has the longest lead time.
2. **Confirm variant selection survives.** Either render core's SKU selector
   inside the custom `ProductDetails` or keep core's PDP for variant products.
   Non-negotiable if any product has shades or sizes.
3. **Routine cross-sell module** below the buy block.
4. **Trust strip** beside the price: shipping, returns, guarantee, B Corp.
5. **Structure the description** — promote the known section markers to real
   headings in `RichText`, or split them into CMS fields.
6. **Gallery zoom.**

### How to measure

- PDP → add-to-cart rate, as the headline.
- For reviews specifically: PDP conversion on products with reviews vs.
  without, once they exist.
- Scroll depth to the description block — currently expected to be poor.
- AOV and units per order, for the cross-sell module.
- Return rate, which good PDP content usually reduces.

---

## 5. Search suggests words, not products — **protect**

**Production today:** typing `arbonne` returns a single text row —
`arbonnecycle`, with the matched prefix bolded. One word. No image, no price,
no product, no indication that anything is buyable.

**POC:** `SearchBox.tsx:47-48` reads
`data?.search?.suggestions?.products` alongside the term list and renders each
through `SearchProductRow.tsx` — thumbnail, product name and formatted price,
linked via `useProductLink` so the click is tracked and client-side.

### Why it matters

A term suggestion does not answer the question the user asked. It rewrites the
query and sends them to a results page — another page load, another render,
another chance to leave. The path is: type → pick a word → load results →
scan → click a product → load PDP.

A product row collapses that to: type → click product → PDP. Two steps instead
of five, from the highest-intent cohort on the site.

The subtler cost is confidence. `arbonnecycle` tells a shopper nothing about
whether Arbonne actually sells anything matching what they typed. A thumbnail
and a price answers "yes, and here it is" before they commit to a page load.
When the answer is genuinely nothing, they find that out one step earlier too —
which is only true if the no-results state exists, and it currently doesn't
(see below).

### What to do

The POC already has this. The work is not losing it in the migration, plus
closing the gaps that would undermine it in production
(all detailed in `ux-fixes.md` §3.2):

- **No no-results state.** `SearchBox.tsx:65` requires `hasResults`, so a query
  with no match renders nothing at all. Shipping product suggestions on top of
  a search that silently shows nothing on a miss wastes the improvement — the
  miss case is where users decide you don't stock what they want.
- **No loading state**, and no debounce on the request.
- **No "see all results for X"** — the exit from an autocomplete into a full
  result set.

### How to measure

- Search → PDP rate, and steps between search and PDP.
- Share of searches that end in a click vs. an exit.
- Revenue per search session vs. per non-search session — the gap is usually
  large, and this widens it.

---

## 6. PLP filters are hidden behind a button and a modal — **protect**

**Production today:** the Nutrition PLP shows a `FILTERS` icon button, a result
count, and a sort dropdown. Clicking `FILTERS` opens an "Apply Filters" modal
covering the results, containing ~22 `Collection` checkboxes in three columns
with more facets below the scroll, and a two-step commit via an
`APPLY FILTERS` button.

**POC:** core FastStore's PLP — a persistent left sidebar with accordion
facets, applied instantly, with the result count updating live.
`custom-theme.scss:343-358` styles `[data-fs-filter]` and
`[data-fs-product-listing-content-grid]` for that layout, and
`overrides/ProductGallery.tsx:10` deliberately keeps core's filters, sort,
pagination and empty state while swapping in the brand product card.

### Why it matters

Four separate costs stack here:

1. **Zero discoverability.** The facets are invisible until you click. On a
   51-product category, faceting is the primary way to narrow — and most users
   never learn which dimensions exist. A sidebar advertises the whole
   navigational vocabulary for free.
2. **The modal covers the results.** You cannot see what a filter does while
   choosing it. Filtering is iterative — try, look, adjust — and that loop is
   broken by construction.
3. **Two-step commit gives no feedback.** Check boxes, then Apply. No live
   count while selecting, so users are guessing. Tick several and you can land
   on zero results with no idea which one caused it, and no way back except
   reopening the modal.
4. **The facet values _are_ the merchandising.** `BeWell`, `EnergyFizz`,
   `GutHealth`, `SkinElixir`, `InnerCalm`, `MindHealth`, `Daily Core` — these
   are Arbonne's regimen sub-brands, and they are how customers actually shop
   nutrition: by need, not by product type. Hiding them behind a button hides
   the brand architecture from the page where it would do the most work.

Filtered sessions typically convert at a multiple of unfiltered ones, because
filtering is an expressed-intent signal. Suppressing filter engagement
suppresses the cohort that was going to buy.

### What to do

Nothing — the POC inherits the correct behaviour from the platform default.
That is the point worth making to stakeholders: **production is running a
custom pattern that performs worse than the thing FastStore ships for free.**
This is the cheapest item on this page and among the more defensible.

One caveat: a drawer or modal is the _right_ pattern on mobile, where a
persistent sidebar has nowhere to live. The change is desktop-only. Confirm
core's responsive behaviour matches that before citing it as fully solved.

### How to measure

- Filter engagement rate — share of PLP sessions applying at least one facet.
  Expect a step change.
- Conversion of filtered vs. unfiltered sessions.
- PLP exit rate, and zero-result rate after filtering.
- Facet-value click distribution — this doubles as merchandising research into
  which regimens people actually shop by.

---

## 7. Shipping simulation — **add**

Neither production nor the POC uses it, and the platform already ships it.

`@faststore/core/src/components/ui/ShippingSimulation/ShippingSimulation.tsx`,
backed by `useShippingSimulation` (`src/sdk/shipping/useShippingSimulation.ts`)
and the VTEX simulation loader
(`@faststore/api/src/platforms/vtex/loaders/simulation.ts`).

Given a postal code and a `{ id, quantity, seller }`, it returns the resolved
city and neighbourhood plus the full SLA list — every shipping method available
for that specific SKU, each with its cost and delivery estimate. It is already
an override slot on `ProductDetails`
(`useOverrideComponents<'ProductDetails'>()`), so it is designed to drop into
exactly the component this POC replaced.

### Why it matters

Unexpected shipping cost is consistently among the top reasons for cart
abandonment, and delivery date is among the top reasons for hesitation. Today
both are unknowable until checkout — the furthest possible point down the
funnel, where an abandonment is most expensive and least recoverable.

Answering both on the PDP moves the objection to where the shopper is still
browsing. Some will leave, and that is fine: they were going to leave at
checkout anyway, having consumed a cart creation and a checkout step first. The
rest get a reason to proceed with confidence.

This is also the concrete answer to the "no shipping estimate near the buy
button" gap in item 4 — not a new component to design, an existing one to wire.

### What to do

Two prerequisites before it is useful:

- **Session regionalization.** `discovery.config.js` currently has
  `session.postalCode: null`, `deliveryMode: null` and `geoCoordinates: null`.
  Decide how postal code is captured and persisted — asked once and remembered
  across PDP, cart and checkout, rather than re-prompted per product. The
  component supports an "I don't know my postal code" affordance
  (`idkPostalCodeLinkProps`) for the capture step.
- **Free-shipping threshold.** If Arbonne has one, the simulation response is
  where to surface progress toward it — "$12 more for free shipping" beside a
  known cart total is an AOV lever layered on top of the abandonment fix. Worth
  confirming the threshold exists and at what value before scoping.

### How to measure

- Checkout abandonment at the shipping step — the primary number.
- PDP → add-to-cart, and cart → checkout completion.
- Simulation usage rate on PDP: how many shoppers actually ask.
- AOV, if a free-shipping threshold prompt is included.
