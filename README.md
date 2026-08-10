# Arbonne FastStore POC

A [FastStore](https://developers.vtex.com/docs/guides/faststore) storefront proof-of-concept
for the VTEX account **`arbonnepoc`**, scaffolded from
[`vtex-sites/starter.store`](https://github.com/vtex-sites/starter.store).

- **VTEX Admin:** https://arbonnepoc.myvtex.com/admin
- **Hosting:** VTEX WebOps (Storefront > FastStore WebOps in Admin), built/deployed from this
  repo's `main` branch — not Vercel.
- **CMS Store ID:** `arbonne-poc` (must match `contentSource.project` in `discovery.config.js`)

## Getting started

```bash
yarn install
yarn dev      # http://localhost:3000, pulls live data from the arbonnepoc account
yarn build    # production build
```

## CMS content

This project uses VTEX's **legacy Headless CMS** (`contentSource: { type: 'CMS' }` in
`discovery.config.js`), not the newer Content Platform. Schema lives in:

- `cms/faststore/content-types.json` — page types (e.g. `landingPage`)
- `cms/faststore/sections.json` — reusable section schemas

After editing either file, sync to VTEX:

```bash
yarn cms-sync
```

Run this in your own terminal, not through an agent/CI pipe — it has interactive prompts
(e.g. confirming schema overrides) that don't survive being piped.

Custom sections are prefixed **`[ARB]`** in their `sections.json` title (e.g. `[ARB] Hero
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
3. Add a matching entry to `cms/faststore/sections.json` — the `name` field must exactly match
   the registry key above. Prefix the schema `title` with `[ARB]`.
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

## Notes for AI agents

See [`CLAUDE.md`](./CLAUDE.md) for the sharp edges we've already hit: why the component
registry can't live under `src/customizations/`, when to nuke the `.faststore` build cache,
and why `contentSource.project` has to match the CMS Store ID exactly.

## Docs

[FastStore documentation](https://developers.vtex.com/docs/guides/faststore)
