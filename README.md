# Arbonne FastStore POC

A [FastStore](https://developers.vtex.com/docs/guides/faststore) storefront proof-of-concept
for the VTEX account **`arbonnepoc`**, scaffolded from
[`vtex-sites/starter.store`](https://github.com/vtex-sites/starter.store).

- **VTEX Admin:** https://arbonnepoc.myvtex.com/admin
- **Hosting:** VTEX WebOps (Storefront > FastStore WebOps in Admin), built/deployed from this
  repo's `main` branch.
- **CMS Store ID:** `arbonne-poc` (must match `contentSource.project` in `discovery.config.js`)

## Getting started

```bash
yarn install
yarn dev      # http://localhost:3000, pulls live data from the arbonnepoc account
yarn build    # production build
```

## CMS content

This project uses VTEX's **Content Platform** (`contentSource: { type: 'CP', project:
'arbonne-poc' }` in `discovery.config.js`). Schema lives in:

- `cms/faststore/components/*.jsonc` — one file per section, keyed by `$componentKey`
- `cms/faststore/pages/*.jsonc` — page content types (e.g. `landingPage`)

After editing either directory, sync to VTEX:

```bash
yarn cms-sync
```

Run this in your own terminal, not through an agent/CI pipe — it has interactive prompts
(store ID, schema version, override confirmations) that don't survive being piped. At the
store ID prompt enter **`arbonne-poc`**; the default `faststore` is wrong for this account.
See `CLAUDE.md` for why that value has to match `contentSource.project`.

Custom sections are prefixed **`[ARB]`** in their `$componentTitle` (e.g. `[ARB] Hero
Banner`) so they're easy to spot in the Admin section picker, separate from FastStore's
built-in sections.

## Adding a new CMS-editable section

1. Build the component at `src/components/<Name>/<Name>.tsx`, with `<Name>.module.scss` and
   `<Name>.types.ts` alongside it.
2. Register it in `src/components/index.tsx`:
   ```tsx
   import MySection from './MySection/MySection'
   export default { MySection }
   ```
3. Add `cms/faststore/components/cms_component__<name>.jsonc` — its `$componentKey` must
   exactly match the registry key above. Prefix `$componentTitle` with `[ARB]`.
4. `yarn cms-sync`, then add the section to a page in Admin.

## Styling

- Use FastStore's design tokens instead of hardcoded values — `--fs-color-*`, `--fs-spacing-*`,
  `--fs-text-*`, etc. (defined in `@faststore/ui/src/styles/base/tokens.scss`).
- Use the breakpoint mixin instead of raw media queries:
  ```scss
  @use '@faststore/ui/src/styles/base/utilities' as u;
  @include u.media('>=tablet') { ... }
  ```
- Nest each component's styles under a single BEM root class (`.mySection { &__title {} }`),
  not flat sibling classes.
- Per-instance CMS-editable values (e.g. a background color field) are legitimately inline
  styles — don't force those into SCSS/tokens.
- Reuse `@faststore/ui`/`@faststore/components` instead of hand-rolling markup they already
  cover. For buttons, use `src/components/Button/Button.tsx` rather than importing
  `LinkButton` directly — it already handles loading the design system's CSS.

## Notes for AI agents

See [`CLAUDE.md`](./CLAUDE.md) for the sharp edges we've already hit: why the component
registry can't live under `src/customizations/`, when to nuke the `.faststore` build cache,
and why `contentSource.project` has to match the CMS Store ID exactly.

## Docs

[FastStore documentation](https://developers.vtex.com/docs/guides/faststore)
