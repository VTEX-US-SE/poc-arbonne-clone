# arbonne-poc — FastStore project notes

FastStore storefront POC for VTEX account `arbonnepoc`, scaffolded from
`vtex-sites/starter.store`. Hosted via VTEX WebOps (not Vercel), GitHub repo
`brightdome/arbonne-poc`.

## CMS architecture

- `discovery.config.js` uses `contentSource: { type: 'CMS' }` — the **legacy**
  VBase-based CMS, not the newer Content Platform (`type: 'CP'`). CP was tried
  first and abandoned: it uploads to a separate schema registry that never
  surfaced in the WebOps-provisioned Headless CMS Admin screen.
- **Do not set `contentSource.project`.** Leave it unset so it defaults to
  `'faststore'`. There is a second CMS project called `arbonne-poc` (created
  during initial WebOps onboarding) — it was a mistake, has since been
  archived in VTEX Admin, and is **not** what's live on production. Setting
  `project: 'arbonne-poc'` was tried and caused `yarn cms-sync`'s merge step
  to silently write to a different `.faststore/cms/<project>/` output than
  the one actually reflecting prod, so custom sections stopped appearing —
  not the field itself, that resolves and merges fine; the project ID being
  wrong is what mattered. If you ever add a `project` value here, verify
  which CMS project is actually live in Admin first, and check the merged
  output at `.faststore/cms/<project>/sections.json` (not just the sync
  command's exit code) before trusting it.
- `cms/faststore/content-types.json` and `cms/faststore/sections.json` are the
  legacy schema files. Sync with `yarn cms-sync` (must run in a real
  interactive terminal — see below).

## Component registry — do not nest under `customizations`

The CLI's `copyUserStarterToCustomizations` step copies the **entire**
project `src/` tree verbatim into `.faststore/src/customizations/src/`. So:

- Put the CMS component registry at **`src/components/index.tsx`**, default-exporting
  `{ SectionName: Component }`. A file placed at
  `src/customizations/src/components/index.tsx` lands one level too deep after
  the copy and is silently ignored (the app falls back to the empty
  `export default {}` placeholder — symptom: "`<Section>` not found" console
  warning, or a blank page).
- Components live flat under `src/components/<Name>/<Name>.tsx` — no `sections`
  subfolder.
- Each section's `name` in `cms/faststore/sections.json` must exactly match its
  key in the `src/components/index.tsx` registry.
- Prefix custom section titles in `sections.json` with `[ARB]` (e.g.
  `"title": "[ARB] Hero Banner"`) so they're easy to spot in the Admin section
  picker, distinct from FastStore's built-in sections.
- Give each component a dedicated `<Name>.types.ts` exporting its props
  interface, imported via `import type`.

## SCSS conventions

- Every custom section's root class includes the shared spacing mixin, so
  stacked sections get a consistent 24px gap without each component
  reinventing it:
  ```scss
  @use '../../styles/mixins';
  .mySection {
    @include mixins.section-spacing;
    ...
  }
  ```
- Use FastStore's design tokens instead of hardcoded values: `--fs-color-*`,
  `--fs-spacing-*`, `--fs-text-*`, `--fs-z-index-*`, `--fs-border-radius-*`
  (defined in `@faststore/ui/src/styles/base/tokens.scss`).
- The three brand font-families are our own tokens, not FastStore's:
  `--arb-font-display` (Bebas Neue), `--arb-font-heading` (Nunito),
  `--arb-font-body` (Nunito Sans). Never write a literal `font-family:
  'Bebas Neue', ...` in a component — reference the token so a future
  brand font change happens in one place. Works the same way from
  inline JS styles (e.g. `Button.colorSchemes.ts`) as `fontFamily:
  'var(--arb-font-body)'` since these are genuinely global custom
  properties (no per-component import needed).
- These tokens (and any future global custom property/theme override)
  belong in `src/themes/custom-theme.scss`'s `.theme {}` block, wired up
  via `src/themes/index.scss` (`@use './custom-theme';`) — **not** in a
  `.module.scss` file. `custom-theme.scss` overrides
  `@faststore/core`'s `src/customizations/src/themes/index.scss`
  placeholder (same override mechanism as the CMS component registry)
  and loads outside the CSS Modules pipeline via `_app.tsx` → `main.scss`
  → `global/index.scss`/`themes/index.scss`. A bare `:root {}` (or even
  `:global(:root)`) inside any `.module.scss` fails the build the moment
  something `@use`s it — Next's CSS Modules loader runs in "pure" mode,
  which rejects a wholly-global selector outright, and `:global()` (the
  usual escape for this) doesn't help in pure mode. Don't reach for a
  `.module.scss`-based tokens file again; this was tried and reverted
  after hitting exactly that build error twice.
- The as-is site's actual mobile/desktop switch is at **1024px**, not
  `@faststore/ui`'s named `tablet` breakpoint (768px) — confirmed via prod
  screenshots (HeroBanner overlay-vs-stacked layout, ImageTextSplit
  row-vs-column) switching well above 768px. Use a raw media query,
  not the mixin:
  ```scss
  @media (min-width: 64rem) { ... }
  ```
  Don't reach for `u.media('>=tablet')` out of habit — none of the
  named breakpoints (`phone` 320px, `phonemid` 375px, `tablet` 768px,
  `notebook` 1280px, `desktop` 1440px) match this site's real 1024px
  switch-point.
- Full-bleed-image sections (HeroBanner) don't overlay content on the image
  below 1024px — image and content stack as two normal blocks instead
  (content gets its own solid backgroundColor fill below the image), and
  only switch to absolute-overlay-within-a-1200px-zone at 1024px+.
  Confirmed via prod screenshots, not assumed from the desktop layout.
- Nest all of a component's styles under a single BEM root class, not flat
  sibling classes:
  ```scss
  .heroBanner {
    &__content { ... }
    &__headline { ... }
  }
  ```
  Referenced in JSX as `styles.heroBanner__headline`.
- CMS-editable values (e.g. a per-instance background color) are legitimately
  inline styles, not tokens — don't force those into SCSS.
- Prefer `@faststore/ui`/`@faststore/components` (`Link`, `LinkButton`, `Button`,
  `Price`, `Icon`, etc.) over hand-rolled markup + CSS for anything they already
  cover. Most of these ship CSS keyed to `data-fs-*` attributes rather than
  importable classnames, and that CSS is **not** globally bundled — it must be
  loaded explicitly via `meta.load-css` wherever used, or the component renders
  unstyled.
- For buttons specifically, use `src/components/Button/Button.tsx` — a thin
  wrapper around `@faststore/ui`'s `LinkButton` that already owns the
  `meta.load-css` calls for `Button`/`LinkButton` styles. Don't import
  `LinkButton` directly and re-load its CSS per-component; go through the
  shared `Button` so the loading only happens in one place.
- CTA buttons are a `colorScheme` prop (see
  `src/components/Button/Button.colorSchemes.ts`), not free hex fields in the
  CMS schema — and padding, font-family, and letter-spacing live in that
  same scheme definition, not in each consumer's own CSS. These are **not**
  universal across schemes even though they look like they should be:
  verified via prod devtools that `white` and `whiteOutline` use different
  padding (4px/60px vs 8px/48px), different font-family (Nunito Sans vs
  Nunito), and different letter-spacing (2px vs 1.06px). Only text-size and
  text-weight (12px/800) are confirmed shared, and those stay in
  `Button.module.scss`. A hex pair for colors alone also can't carry hover
  states — the real `whiteOutline` hover is a solid `#252525` fill with
  white text, not reproducible from a background/text pair. Add a new named
  scheme (with its own full set: colors, hover colors, padding, font,
  letter-spacing) rather than adding a one-off field or prop when a section
  needs a different CTA treatment — don't assume any of these values
  transfer from an existing scheme without checking the real site.
- `letter-spacing` on a button label adds trailing space after the last
  character, visually uncentering short labels inside a pill. `Button`
  compensates for this automatically (wraps the label in its own span with
  a matching negative margin) using each scheme's own `letterSpacing`
  value — this isn't something a consumer passes in.
- No `box-sizing: border-box` reset applies anywhere in this app's global
  styles (checked — it genuinely doesn't exist, not just hard to find).
  `Button.module.scss` sets it explicitly on `.button` because mixing an
  explicit `height` with `padding` under the browser's default
  `content-box` makes them **add together** instead of `height` including
  the padding — a scheme's declared height silently became height +
  padding + border in the actual render (40px height read as ~58px). Any
  future component that sets both an explicit `height`/`width` and
  `padding` needs its own `box-sizing: border-box`, or the same bug repeats.

## Build cache gotchas

`.faststore/` is a generated build cache/scaffold, regenerated from `src/` and
`discovery.config.js` on file changes. Its incremental watcher has missed
changes a couple of times (a moved/renamed file, and the components registry
after a location fix) while every other file synced fine.

**Never delete `.faststore` while `yarn dev` is running.** Its live file
watcher expects that directory to persist and gets incrementally updated by
it — yanking it out mid-session causes `ENOENT: .faststore/src/pages`
crashes and an Internal Server Error on every request until restarted. This
happened repeatedly from reflexively wiping the cache after every small
edit; don't do that. Only clear it when there's an actual, confirmed
staleness symptom (a change genuinely not reflected after a normal
fast-refresh), and even then:
1. Ask the user to stop `yarn dev` first (or confirm it's already stopped).
2. `rm -rf .faststore`
3. Have them start `yarn dev` again fresh.

Never run step 2 without confirming step 1 happened.

## Interactive commands need a real terminal

`yarn cms-sync`, `git push`, `vtex login`/`vtex use`, and anything needing
SSH/GPG passphrases or OAuth **must be run by the user in their own terminal**
(via the `!` prefix or directly) — not piped through the agent's Bash tool.
Piping answers (e.g. `printf 'yes\n' | yarn cms-sync`) has caused the CLI to
misinterpret stdin as a positional CLI argument, scaffolding a bogus project
into a literal `yes/` directory. If a command hangs on a prompt from the
agent's Bash tool, stop and hand it to the user instead of retrying with
piped input.
