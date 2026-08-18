# Arbonne FastStore POC

A [FastStore](https://developers.vtex.com/docs/guides/faststore) storefront
proof-of-concept for the VTEX account **`arbonnepoc`**, scaffolded from
[`vtex-sites/starter.store`](https://github.com/vtex-sites/starter.store).

- **VTEX Admin:** https://arbonnepoc.myvtex.com/admin
- **Hosting:** VTEX WebOps (Storefront > FastStore WebOps in Admin), built and
  deployed from this repo's `main` branch.
- **CMS Store ID:** `arbonne-poc` — must match `contentSource.project` in
  `discovery.config.js`.

## Getting started

```bash
yarn install
yarn dev      # http://localhost:3000, pulls live data from the arbonnepoc account
yarn build    # production build
```

## Layout

```
src/components/<Name>/    components — <Name>.tsx, .module.scss, .types.ts
src/components/index.tsx  section registry the CMS renders from
src/fragments/            overrides of core's page-query fragments
src/graphql/queries/      client GraphQL documents, one per operation
src/graphql/vtex/         server-side schema extensions and resolvers
src/hooks/                stateful helpers, anything doing I/O
src/utils/                pure helpers
src/themes/               global tokens and theme overrides
cms/faststore/components/ CMS schema, one .jsonc per section
cms/faststore/pages/      CMS page content types
discovery.config.js       account, content source, feature flags
```

## Adding a CMS-editable section

1. Build the component at `src/components/<Name>/<Name>.tsx`, with
   `<Name>.module.scss` and `<Name>.types.ts` alongside it.
2. Register it in `src/components/index.tsx`:
   ```tsx
   import MySection from './MySection/MySection'
   export default { MySection }
   ```
3. Add `cms/faststore/components/cms_component__<name>.jsonc`. Its
   `$componentKey` must exactly match the registry key above, and
   `$componentTitle` should be prefixed `[ARB]`.
4. Run `yarn cms-sync` in your own terminal (it's interactive), then add the
   section to a page in Admin.

## Before you change anything

Read [`CLAUDE.md`](./CLAUDE.md). It documents the conventions and the sharp
edges already hit on this project — why the registry can't live under
`src/customizations/`, why the breakpoint is 1024px and not the `tablet` mixin,
how buttons handle their own styling, when it's safe to clear the `.faststore`
cache, and why a wrong CMS store ID renders a blank page with no error.

[`AGENTS.md`](./AGENTS.md) covers the generic FastStore platform rules.
