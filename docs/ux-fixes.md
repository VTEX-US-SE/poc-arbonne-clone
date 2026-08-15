# UX fixes — component review

Findings from a full read of `src/` (24 components, ~6.9k lines), ordered by
leverage. Each item names the file and line it lives at, why it matters, and
the smallest change that resolves it.

**Out of scope here** — the mega-menu open interaction is a separate
workstream and is deliberately excluded. See [Deferred](#deferred) at the
bottom for exactly what that covers, so the two efforts don't collide.

---

## Phase 1 — correctness

Real bugs. These ship wrong data or lock users out, not just annoy them.

### 1.1 PDP adds the wrong quantity

`PurchaseCta.tsx:30` — `<QuantitySelector min={1} initial={1} …>`, hardcoded
at both call sites.

`QuantitySelector` is uncontrolled: it holds its own state seeded from
`initial` (`@faststore/components/src/molecules/QuantitySelector/QuantitySelector.tsx:58`).
The parent's `quantity` state and the widget's displayed value drift apart the
moment a second instance mounts.

Reproduction:

1. Set quantity to 3 in the one-time CTA. Parent `quantity` = 3, `buyProps`
   built with 3.
2. Switch to ReplenishMe. The old `PurchaseCta` unmounts; the new one mounts
   at `initial={1}` and **displays 1**. Parent state is still 3.
3. Click "Add to ReplenishMe" → **3 units are added.**

Same drift between the inline CTA and `StickyBar` (`ProductDetails.tsx:167-176`):
scroll down and the sticky bar mounts a fresh selector reading 1 while the cart
receives whatever the inline one had.

**Fix:** pass `initial={quantity}` instead of `initial={1}`. The component has
a `useEffect` on `initial` (line 111-113) that resyncs, so this is sufficient —
no controlled-component rewrite needed.

### 1.2 Duplicate DOM ids from `QuantitySelector`

Upstream: the component hardcodes `id="quantity-selector-input"` and
`aria-controls="quantity-selector-input"` (lines 130, 138, 151).

Consequences in this codebase:

- A 4-card `ProductShowcases` grid emits four identical ids.
- The PDP emits two at once — `PurchaseOptions` stays mounted behind
  `StickyBar`, it is only scrolled out of view.

Label association and `aria-controls` both break. Not our bug, but it is our
symptom.

**Fix:** no clean local fix without forking the component. Log it upstream and
note it here. If it becomes a blocker, wrap in a container that rewrites the id
after mount, or vendor the component.

### 1.3 `CountrySelectorModal` rows are keyboard-dead

`CountrySelectorModal.tsx:75, 96` — `onClick` on a bare `<li>`, with
`cursor: pointer` in the stylesheet (`CountrySelectorModal.module.scss:59`) and
no role, no `tabIndex`, no key handler.

It looks clickable and cannot be operated by keyboard at all.

**Fix:** wrap each row's content in a `<button type="button">` filling the row,
or give the `<ul>` `role="listbox"` and each row `role="option"` +
`tabIndex` + Enter/Space handling. The button is the lazier and more robust of
the two.

While in there: rows are ~38px tall (`padding: var(--fs-spacing-2) 0`) on what
is a full-screen mobile modal — raise to a 44px minimum.

### 1.4 Locale switch has no pending state

`CountrySelectorModal.tsx:32-37` — selecting a locale calls `save()`, which
redirects. Between click and navigation the modal just sits there with no
feedback.

**Fix:** disable the list and show a spinner or "Switching…" on the selected
row while `pendingLocale` is set.

### 1.5 Add-to-cart is unreachable on large touch devices

`ProductCard.module.scss:150-185` — the whole cart block is
`opacity: 0; visibility: hidden` until `:hover`, inside a bare
`@media (min-width: 64rem)` with no hover-capability guard.

An iPad Pro in landscape, a Surface, any 1024px+ touch device therefore gets a
product card with **no purchasable control at all**.

`custom-theme.scss:185` already uses `@media (hover: hover)` for the core
product card, so the pattern is established — it just was not applied to ours.

**Fix:** see 2.4, which resolves this by removing the hover reveal entirely. If
the reveal is kept for any reason, the media query must become
`@media (min-width: 64rem) and (hover: hover)`.

---

## Phase 2 — highest leverage

Small diffs, large surface.

### 2.1 Every navigation link is a full page reload

Zero `next/link` imports across the tree — only `next/router`, in
`SearchBox.tsx:2` and `AssemblySet.tsx:1`.

Raw `<a href>` in: `Header.tsx:78, 118, 133`, `MegaMenuPanel.tsx:41, 60`,
`MobileMenu.tsx:68, 79`, `Footer.tsx:33, 43, 67`, `AssemblySet.tsx:178`,
`LoginModal.tsx:72`, `MobileTabItem.tsx:35`.

Every one is a full document reload: white flash, re-hydration, no prefetch.
`ProductCard` and `SearchProductRow` already do this correctly via
`useProductLink` — the header and footer, the two most-clicked surfaces on the
site, do not.

**Fix:** swap to `next/link` for all same-site hrefs. Mechanical. Keep raw
`<a>` for anything `slugHref` cannot resolve and for external URLs (footer
legal links, social, account URLs from the CMS — check each).

**Watch:** `slugHref` returns `'#'` for a missing slug (see 3.1) — resolve that
first or `next/link` will prefetch `/#`.

### 2.2 Focus is invisible site-wide

Grep for `focus` in `src/` returns six hits, three of which are `.focus()`
calls. Every custom `<button>` here strips `border` and `background` and none
declares `:focus-visible`.

Affected: `Header.__iconButton`, `__navToggle`, `__mobileFlagButton`,
`MobileTabItem`, `MegaMenuPanel.__close`, `MobileMenu.__close`,
`MobileMenu.__itemHeader`, `ProductShowcases.__tab`,
`AssemblySet.__stepperButton`, `AssemblySet.__cta`, `CountrySelectorModal`
rows.

WCAG 2.4.7 failure across essentially the whole custom surface.

**Fix:** one global rule in `custom-theme.scss`:

```scss
:focus-visible {
  outline: 2px solid var(--arb-color-text);
  outline-offset: 2px;
}
```

Check it does not fight `@faststore/ui`'s own ring on `[data-fs-button]`;
scope it to bare elements if it does.

### 2.3 No `aria-current` anywhere

Nav items, showcase tabs, footer links, mobile tab bar — nothing marks the
current page or panel. Users never know where they are.

**Fix:** `aria-current="page"` on the matching nav/footer link (compare against
`router.asPath`), `aria-current="true"` on the active `MobileTabItem`. Pair
each with a visible style, not just the attribute.

### 2.4 Remove the hover-reveal on `ProductCard`

`ProductCard.module.scss:150-185`. Beyond the touch-device lockout in 1.5:

- **`transform: scale(1.12)` on hover** against a `--fs-spacing-3` grid gap
  (`ProductShowcases.module.scss:77`). A 12% scale overlaps neighbouring cards;
  sweeping the mouse across the grid flickers.
- **Bottom-row cards** render their cart panel at `top: 100%`, past the section
  boundary and over whatever follows.
- **`prefers-reduced-motion` (line 187) kills the transitions but not the
  transform.** Reduced-motion users still get the 12% jump, just instantly.
- Keyboard users have `:focus-within` handling (good) but must Tab into an
  invisible control to reveal it.

**Fix:** show the cart block at all breakpoints — mobile already does. Drop the
scale, or reduce it to ~1.02 and add `transform` to the reduced-motion reset.
The reveal buys nothing and costs conversions on every device that cannot
hover.

### 2.5 `--fs-text-face-body` is Inter, the brand is Nunito

`custom-theme.scss:69-70` sets the FastStore body face to Inter while
`--arb-font-body` is Nunito Sans. Every platform-native surface — cart sidebar,
PLP filters, quantity inputs — renders in Inter directly beside custom sections
in Nunito. Visible the moment the cart opens.

**Fix:** point `--fs-text-face-body` at `var(--arb-font-body)`. Verify against
prod first; this may have been a deliberate scaffold leftover rather than a
choice.

### 2.6 Warning and success share a background colour

`custom-theme.scss:60-61` — `--fs-color-warning-bkg` and
`--fs-color-success-bkg` are both `#e9fce3`. Warnings will read as successes.

**Fix:** give warning its own token.

### 2.7 `--arb-color-gray-muted` fails contrast as text

`#858585` on white is **3.7:1** — below AA's 4.5:1 for normal text.

Used as text at: `SearchBox.module.scss:47` (placeholder),
`LoginModal.module.scss:51` (the "OR" divider),
`AssemblySet.module.scss:265` (disabled stepper).

Used as a border/fill at `AssemblySet.module.scss:140, 333` and
`ProductDetails.module.scss:197, 232` — those are fine, and the disabled states
are formally exempt.

**Fix:** darken to ~`#6b6b6b` (4.6:1) for the text uses, or introduce a second
token so the border uses keep the lighter value.

### 2.8 No skip-to-content link

Sticky header + mega nav + mobile tab bar is a long run of repeated links
before main content on every page.

**Fix:** standard visually-hidden-until-focused skip link as the first element
in `Header`.

---

## Phase 3 — component-level

### 3.1 `slugHref` silently produces dead links

`utils/href.ts:8` — returns `'#'` when the slug is empty. Any CMS nav item with
an unfilled slug becomes a link that jumps to the top of the page, with no
error anywhere.

**Fix:** return `undefined` and have callers render a `<span>` (styled as the
column title where appropriate) when there is no destination. A link to nowhere
is worse than plain text, and this also unblocks 2.1.

### 3.2 SearchBox

The best-built component in the repo. Gaps, roughly in priority order:

- **No no-results state.** `showResults = expanded && term.length > 0 && hasResults`
  (`SearchBox.tsx:65`). A term with no matches shows nothing at all —
  indistinguishable from "still loading". Add an explicit empty state.
- **No loading state.** `useSuggestions` exposes only `data`; while a request
  is in flight the previous term's results stay on screen.
- **No debounce.** `useDeferredValue` defers *rendering*, not the request, so
  `useSuggestions(deferredTerm)` fires near-per-keystroke. Add ~250ms.
- **ArrowDown does nothing.** The docstring (lines 24-25) explains suggestions
  are `<button>`s "so they are reachable by Tab without a custom roving-focus
  implementation". Tab works, but arrow keys are what users press in a search
  field. Reuse the roving-tabindex pattern already written in
  `ProductShowcases.tsx:41-53`.
- **No `role="listbox"` / `aria-live`** — nothing is announced when results
  appear.
- **No "see all results for X" row** — the standard escape hatch out of an
  autocomplete.
- **The magnifier is a no-op when already expanded** (`SearchBox.tsx:74`,
  `setExpanded(true)` on an already-true state). It reads as a submit button
  and never is. Either make it submit or add a visible submit affordance;
  Enter works but nothing says so.
- **Layout check at exactly 1024px:** `__form` expands to 15rem
  (`SearchBox.module.scss:23-33`) inside `__utility`, a flex row with a 1.75rem
  gap holding the Login icon + label, cart and flag. Verify it does not crowd
  them.

### 3.3 ProductShowcases

Roving tabindex and arrow keys are correct (`ProductShowcases.tsx:41-53, 84`).

- **The grid empties on tab switch.** `products` falls back to `[]` while
  refetching (line 39) — the section collapses to zero height and springs back.
  Add skeletons, or hold the previous set until the new one resolves.
- **No empty state** if a collection returns nothing.
- **Tabs overflow on small screens.** `display: flex; justify-content: center`,
  no wrap, `min-width: 6.5625rem` per tab
  (`ProductShowcases.module.scss:43-53`). Four-plus tabs on a 360px phone
  overflow with no horizontal scroll. Decide between `overflow-x: auto` and
  `flex-wrap`.
- **No `:hover` on tabs**; the only selected indicator is a 2px underline
  shifting from `gray-line` to `text`.
- Missing Home/End keys and `aria-orientation` on the tablist. Minor.

### 3.4 ProductDetails

- **`role="radiogroup"` with `role="radio"` buttons and no arrow-key
  handling** (`PurchaseOptions.tsx:61-99`). ARIA radio semantics promise
  Up/Down/Left/Right cycling; screen readers announce "radio, 1 of 2" and then
  the interaction does not match the promise.
  **Fix:** native `<input type="radio">` — keyboard behaviour, form semantics
  and focus come free. Falling back to a roving tabindex is acceptable but
  strictly more code.
- **`StickyBar` and the mobile tab bar occupy the same slot.** Both are
  `position: fixed; bottom: 0; z-index: var(--fs-z-index-top)`
  (`ProductDetails.module.scss:151-156`, `Header.module.scss:45-58`).
  `custom-theme.scss:11-15` pads the body for the tab bar but nothing accounts
  for the sticky bar stacked on it. Offset the sticky bar by the tab bar height
  below 1024px, or suppress one of them.
- **Two identically-named "Add to Cart" buttons** in the a11y tree once the
  sticky bar mounts. Give the sticky one a distinguishing accessible name.
- **The sticky bar hard-mounts** with no transition (`ProductDetails.tsx:167`).
- **Selecting ReplenishMe mounts a whole new CTA block below the label**
  (`PurchaseOptions.tsx:108`), shifting content under the cursor.
- **The description is unstructured catalog HTML** via `RichText`
  (`ProductDetails.tsx:160`). "WHY IT'S DIFFERENT" and "GOOD FOR" are
  presumably `<p><strong>`, so the PDP has an `<h1>` and then no headings at
  all — no skimming, no landmark navigation. Consider promoting known section
  markers to real headings in `RichText`, or splitting them into CMS fields.
- **No image zoom** on the main gallery. Standard on beauty and nutrition PDPs.
- **Out of stock only disables the button** (`ProductDetails.tsx:154`) — no
  "Out of stock" text anywhere. Same on `ProductCard.tsx:124`.
- `sizePropertyName = 'Volume'` (line 38) silently drops the size line for any
  product lacking that property. Acceptable, but worth a fallback.

### 3.5 AssemblySet

Strongest reasoning in the repo — progress bar, token expansion, min/max
clamping, gated CTA are all deliberate. Remaining gaps:

- **The CTA has no `onClick`** (`AssemblySet.tsx:262-268`). The entire flow
  terminates in a dead button. Highest-visibility gap on the page.
- **The progress signal and the gate deliberately disagree.**
  `SetGroup.tsx:20-23` turns the bar green at `maxQuantity`;
  `isGroupSatisfied` (`AssemblySet.utils.ts:29-36`) enables the CTA at
  `minQuantity`. A user can face a grey "incomplete" bar next to an enabled
  button. The rationale is documented and sound; the message to the user is
  not. Either mark completion at `minQuantity` with a distinct "you can add
  more" state above it, or gate the CTA at `maxQuantity`.
- **No feedback when `+` is blocked by the group max.** `canIncrease` just
  disables the button (`ItemCard.tsx:20, 56`). At 5/5, swapping an item
  requires deducing that you must decrement first. One inline line — "Remove
  one to add another" — fixes it.
- **`aria-live="polite"` on every item's count** (`ItemCard.tsx:48`) announces
  bare numbers with no context. Move to one live region per group announcing
  "3 of 5 selected"; the `aria-label` on the progressbar (`SetGroup.tsx:49`)
  will not reliably re-announce on change.
- **Stepper buttons are 28×50px** (`AssemblySet.module.scss` `__stepperButton`,
  `width: 1.75rem`) — under 44px on touch. Same stepper is reused in the
  summary row.
- **The page hides the header and footer entirely**
  (`custom-theme.scss:20-27`). No logo, no cart, no search — the only exit is
  the back link, and the user cannot check what is already in their cart before
  adding a set. Defensible for a configurator; reconsider at minimum a cart
  affordance.
- **"Customization Details" never lists what was chosen** — prices only
  (`AssemblySet.tsx:216-259`). No way to verify the set without scrolling back
  through the grid.
- **`sets` has no upper bound** (`AssemblySet.tsx:253`).
- **The disabled CTA is `gray-muted`** (`AssemblySet.module.scss:333`) — the
  default state until completion, and it reads as broken rather than pending.
  Formally exempt from contrast rules; still worth a distinct "not yet" style.

### 3.6 MobileMenu and mobile surfaces

- **The caret never rotates** (`MobileMenu.tsx:53`, always `CaretDown`) while
  the desktop equivalent swaps to `CaretUp` (`Header.tsx:145`). Inconsistent,
  and the only expand feedback is the content appearing.
- **No transition on expand/collapse** — content pops.
- **Links are ~24px tall** (`MobileMenu.module.scss:78-85`,
  `padding: 0.375rem 0`). Well under 44px.
- **Mobile tab bar has no active state** — no `aria-current`, no styling (see
  2.3). `MobileTabItem` also has `padding: 0`
  (`MobileTabItem.module.scss:10`), so the tap target is exactly the content.
- **`useIsMobile` returns `false` on first render** (documented,
  `hooks/useIsMobile.ts:13`), so `SearchBox` server-renders the *desktop*
  markup and swaps after hydration — a visible flash on slow phones. The branch
  in `SearchBox.tsx:139-174` is purely presentational; rendering both and
  hiding one in CSS removes the hook, the flash, and a state update.
- **`useLockBodyScroll` uses `body { overflow: hidden }`**
  (`hooks/useLockBodyScroll.ts:14`) — does not reliably hold on iOS Safari and
  loses scroll position on close. Known platform issue; the fix is
  `position: fixed` plus restoring `top`. Low priority for a POC.

### 3.7 Header, excluding the menu interaction

- **The nav row deletes itself on scroll.** `Header.module.scss:94-99`
  collapses `__navList` to `max-height: 0` once `data-scrolled` is set, and
  `Header.tsx:51` sets it at `scrollY > 80` but only clears it below **10px**.
  So on any page below the fold there is no navigation at all, and recovering
  it means scrolling to the very top. The hysteresis is a good instinct; the
  10px value makes it one-way in practice.
  **Fix:** raise the clear threshold to something reachable (~40px), or keep a
  compact sticky nav instead of removing it. Worth checking against prod
  before changing — this may be intentional.
- **Raw `<img>` with no dimensions** at `Header.tsx:79, 118` — CLS on load.
  See 3.8.

### 3.8 Images without dimensions

Raw `<img>`, no `width`/`height`, causing layout shift:
`Header.tsx:79, 118` (logo), `MegaMenuPanel.tsx:77` (banner),
`Footer.tsx:49, 59` (social, B Corp badge), `AssemblySet.tsx:164` (aside).

Everything else correctly uses the optimised `Image` from
`@faststore/core/experimental`.

**Fix:** add explicit dimensions, or move to `Image` where the source is a
VTEX asset. `AssemblySet`'s aside image is also missing `loading="lazy"` while
its card images have it (`ItemCard.tsx:29`).

### 3.9 Footer

- **Social links double-announce.** `aria-label={social.alt}` on the `<a>` and
  `alt={social.alt}` on the `<img>` (`Footer.tsx:46-50`). Set the img
  `alt=""` — the link already carries the name.
- **Social icons render nested inside the last link column**
  (`Footer.tsx:39`). Documented as matching Figma, but if that column has no
  links the social block still renders under an empty heading.

### 3.10 MegaMenuPanel layout

Excluded from the menu-interaction workstream — this is pure layout.

- **`margin-left: 7.5rem`** on both `__columns` and `__simpleList`
  (`MegaMenuPanel.module.scss:34, 44`) is a magic number unrelated to the nav
  items above it and outside the site's 1200px content grid, so panel columns
  will not align with their trigger at any viewport width.
- The panel is full-bleed via `left: -2.5rem; right: -2.5rem`
  (`Header.module.scss:188-193`) while its contents are not constrained to the
  same max-width the rest of the site uses.

**Fix:** constrain panel content to the shared 1200px zone and drop the fixed
indent.

---

## Deferred

Not in this plan — belongs to the mega-menu interaction workstream:

- Hover-intent open on top-level nav items (open/close delays, `(hover: hover)`
  guard).
- Making the item label open the panel rather than only the 12px caret
  (`Header.tsx:131-153`).
- Escape and click-outside to close the panel.
- Focus management on open/close, and `aria-controls` linking the caret to the
  panel.
- Panel enter/exit transition (`Header.tsx:156` currently hard-mounts).
- `:hover` styling on `__navItem` (`Header.module.scss:162-175`) — the focus
  half is covered by 2.2, but the hover treatment should be designed alongside
  the open behaviour.
- `Header.tsx:59-63` force-closing the panel on scroll — entangled with 3.7,
  but the panel half of it belongs with the menu work.

---

## Keep

Worth protecting through all of the above:

- `BaseModal` centralising the scroll lock and the unmount-when-closed — one
  place a new modal cannot forget it.
- The `Button` colorScheme system, including the negative-margin letter-spacing
  compensation.
- The roving tabindex in `ProductShowcases` — the only correct keyboard widget
  in the repo, and the template for fixing the others.
- `SetGroup`'s progressbar semantics and the `||`-not-`??` empty-CMS-string
  handling.
- `useDeferredValue` plus the substring highlight in search — the
  "not necessarily a prefix" note in `utils/highlight.tsx` is a real insight.
- `prefers-reduced-motion` in `ProductCard` — incomplete, but the only one in
  the codebase.
- Art-directed mobile/desktop images in `HeroBanner` and `CategoryHero`.
