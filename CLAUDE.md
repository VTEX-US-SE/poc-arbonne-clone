# arbonne-poc — project conventions and gotchas

FastStore storefront POC for VTEX account `arbonnepoc`, scaffolded from
`vtex-sites/starter.store`. Hosted via VTEX WebOps, GitHub repo
`brightdome/arbonne-poc`.

Generic FastStore/VTEX platform rules live in `AGENTS.md`. This file is only
the things specific to this project, most of which cost us a debugging
session to find.

## CMS — Content Platform (CP)

`discovery.config.js`: `contentSource: { type: 'CP', project: 'arbonne-poc' }`.
Migrated off the legacy VBase CMS.

- **`contentSource.project` is the CP store ID, not a CMS project name.** Under
  the old `type: 'CMS'` it selected a CMS project and setting it broke sync —
  the reverse rule. Under CP, `service.ts` reads
  `contentSource.project ?? 'faststore'` and uses it as `{storeId}` in
  `/api/content-platform/data/{account}/{storeId}/...`.
- Three values must agree, and none is guessable:

  | Where                           | Value         |
  | ------------------------------- | ------------- |
  | `yarn cms-sync` store ID prompt | `arbonne-poc` |
  | `contentSource.project`         | `arbonne-poc` |
  | `api.storeId` (the **account**) | `arbonnepoc`  |

- A wrong store ID returns **HTTP 200 with `{"entries":[]}`**, not a 404 — the
  symptom is a silently blank page with nothing in the logs. The CLI prompt
  defaults to `faststore`, which is not a store on this account; do not just
  press Enter. Read the real value from Admin → Content → Stores, or
  `GET .../api/content-platform/manage/arbonnepoc/stores`.
- Schema lives in `cms/faststore/components/*.jsonc` (one per section) and
  `cms/faststore/pages/*.jsonc`.
- `yarn cms-sync` runs `vtex content generate-schema` → `upload-schema`. Schema
  versions are immutable — bump on every re-upload. It generates and then
  deletes `cms/faststore/schema.json`; that is a build artifact, never commit it.
- Content **entries** live in the CP data plane, not this repo. Migrating
  schema does not migrate content.

## Component registry — do not nest under `customizations`

The CLI copies the **entire** project `src/` tree verbatim into
`.faststore/src/customizations/src/`. Therefore:

- The registry goes at **`src/components/index.tsx`**, default-exporting
  `{ SectionName: Component }`. Putting it at
  `src/customizations/src/components/index.tsx` lands one level too deep after
  the copy and is silently ignored — symptom: "`<Section>` not found" console
  warning, or a blank page.
- Components live flat at `src/components/<Name>/<Name>.tsx`. No `sections`
  subfolder.
- Each `$componentKey` in `cms/faststore/components/*.jsonc` must exactly match
  its registry key. Prefix `$componentTitle` with `[ARB]` so custom sections are
  easy to spot in the Admin picker.
- Give each component a `<Name>.types.ts` exporting its props, imported via
  `import type`.
- **Every component gets its own folder, including sub-components**, holding
  its `.tsx`, its `.module.scss` and its `.types.ts`:
  `AssemblySet/ItemCard/ItemCard.tsx`. Only the registry section itself sits at
  `src/components/<Name>/<Name>.tsx` — nesting *that* one breaks the CLI copy.
- A sub-component owns its own stylesheet under its own BEM root
  (`.itemCard { &__body {} }`), not a slice of the parent's. If two
  sub-components need the same block, that block is its own component —
  `AssemblySet/Stepper` exists because the item cards and the summary row were
  sharing stepper classes.
  Skeletons are the exception: they deliberately import the real components'
  modules so the placeholder cannot drift from the layout it stands in for.

## Queries and utils are central, not colocated

- **Client GraphQL documents live in `src/graphql/queries/`**, one file per
  operation (`queries/assemblySet.ts`), never inside the component. Codegen's
  glob is `./src/**/*.{ts,tsx}` relative to `.faststore/`, so it picks them up
  wherever they sit in `src/`.
  `src/graphql/vtex/` is the *server* side — resolvers and typeDefs for the API
  — and is unrelated.
- **Pure helpers live in `src/utils/`**, named for their domain
  (`utils/assemblySet.ts`), alongside `href.ts` and `highlight.tsx`. Domain
  types stay with their component, so a utils module importing
  `../components/<Name>/<Name>.types` is expected.

## Imports — relative for ours, `src/*` for core

`src/*` resolves to **core's** `.faststore/src/*`, never our own tree, because
the CLI copies us into `.faststore/src/customizations/src/`. So:

- Project-local files: relative (`../../utils/href`). Writing
  `src/utils/href` silently resolves to core's `src/utils/`, not ours.
- Core SDK and generated types: `src/sdk/...`, `@generated`.
- Root `tsconfig.json` maps those two aliases into `.faststore/` so the editor
  and `tsc` resolve them. `.faststore/` is generated, so type-checking needs
  one `yarn dev` after a fresh clone. It also pulls core's own sources into the
  program, and those don't pass our `strict` settings — filter when checking
  from the CLI: `npx tsc --noEmit | grep '^src/'`.
- `@faststore/core/experimental` is deliberately **not** mapped. VTEX's own
  convention for the `*_unstable` hooks is the `// @ts-ignore next-line` above
  the closing brace of the import; the error is cosmetic. Keep it.

## SCSS

- Include the shared spacing mixin on every section's root class, so stacked
  sections get a consistent 24px gap:
  ```scss
  @use '../../styles/mixins';
  .mySection {
    @include mixins.section-spacing;
  }
  ```
- Nest a component's styles under one BEM root class (`.heroBanner { &__headline {} }`),
  referenced as `styles.heroBanner__headline` — not flat sibling classes.
- Prefer FastStore tokens over hardcoded values: `--fs-color-*`, `--fs-spacing-*`,
  `--fs-text-*`, `--fs-z-index-*`, `--fs-border-radius-*` (see
  `@faststore/ui/src/styles/base/tokens.scss`).
- Brand fonts are our own tokens: `--arb-font-display` (Bebas Neue),
  `--arb-font-heading` (Nunito), `--arb-font-body` (Nunito Sans). Never write a
  literal `font-family`. These are real global custom properties, so they work
  from inline JS styles too (`fontFamily: 'var(--arb-font-body)'`).
- **Global tokens go in `src/themes/custom-theme.scss`'s `.theme {}` block**,
  wired via `src/themes/index.scss` — never a `.module.scss`. Next's CSS Modules
  loader runs in "pure" mode and rejects a wholly-global selector; `:global()`
  does not help. A `.module.scss` tokens file was tried and reverted twice.
- **The mobile/desktop switch is 1024px**, confirmed against prod. Use a raw
  media query — `@media (min-width: 64rem)`. Do **not** use `u.media('>=tablet')`;
  none of the named breakpoints (`phone` 320, `phonemid` 375, `tablet` 768,
  `notebook` 1280, `desktop` 1440) match this site.
- Full-bleed sections (HeroBanner) do not overlay content below 1024px — image
  and content stack as two blocks, content taking its own solid background fill.
  Absolute overlay within a 1200px zone only applies at 1024px+.
- CMS-editable per-instance values (e.g. a background color field) are
  legitimately inline styles. Don't force those into SCSS.
- No `box-sizing: border-box` reset exists globally (verified). Any component
  setting both an explicit `height`/`width` and `padding` must set it itself, or
  the two **add together** under `content-box` — a declared 40px button height
  rendered at ~58px.

## Buttons

Use `src/components/Button/Button.tsx`, a wrapper around `@faststore/ui`'s
`LinkButton` that owns the `meta.load-css` calls. Don't import `LinkButton`
directly and re-load its CSS per component.

- CTA styling is a `colorScheme` (see `Button.colorSchemes.ts`), not hex fields
  in the CMS schema. Padding, font-family and letter-spacing live in the scheme
  too — and are **not** shared across schemes despite looking like they should
  be: `white` vs `whiteOutline` differ in padding (4px/60px vs 8px/48px),
  font (Nunito Sans vs Nunito) and letter-spacing (2px vs 1.06px). Only
  text-size/weight (12px/800) are shared, and those stay in `Button.module.scss`.
- Add a new named scheme (with its full set: colors, hover colors, padding,
  font, letter-spacing) rather than a one-off prop. A colors-only pair can't
  express hover — real `whiteOutline` hover is a solid `#252525` fill with white
  text. Never assume a value transfers from an existing scheme without checking
  the real site.
- `fontSize` is applied by overriding the `--fs-button-text-size` **variable**,
  and `textDecoration` by a scoped
  `[data-color-scheme='greenLink'] [data-fs-button-wrapper]` rule. Both because
  `@faststore/ui` sets those properties on its own inner wrapper element, so a
  plain inline style on the outer element is shadowed. Custom properties cascade
  to descendants (hence the variable); `textDecoration` has none, hence the
  selector. Don't "simplify" either back into an inline style.
- `letter-spacing` adds trailing space after the last character, uncentering
  short labels. `Button` compensates automatically with a negative-margin span
  using each scheme's own `letterSpacing`; consumers pass nothing.

## Build cache

`.faststore/` is generated from `src/` and `discovery.config.js`. Its watcher
has missed changes a few times — moved/renamed files, and the registry after a
location fix.

**Never delete it while `yarn dev` is running.** The watcher expects the
directory to persist; removing it mid-session causes `ENOENT:
.faststore/src/pages` and an Internal Server Error on every request until
restarted. Only clear it on a confirmed staleness symptom (a change genuinely
not reflected after a normal fast refresh), and then: stop `yarn dev` first,
`rm -rf .faststore`, start it again. Never the middle step without the first.

## Interactive commands need a real terminal

`yarn cms-sync`, `git push`, `vtex login`/`vtex use`, and anything needing
SSH/GPG passphrases or OAuth **must be run by the user**, not piped through the
agent's Bash tool. Piping answers (`printf 'yes\n' | yarn cms-sync`) made the
CLI read stdin as a positional argument and scaffold a bogus project into a
literal `yes/` directory. If a command hangs on a prompt, hand it over rather
than retrying with piped input.
