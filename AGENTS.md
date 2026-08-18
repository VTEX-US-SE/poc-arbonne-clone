# AGENTS.md — arbonne-poc

A FastStore + VTEX storefront on Next.js, React, TypeScript and GraphQL,
deployed through VTEX WebOps.

This file covers generic FastStore platform rules. **Project-specific
conventions and the gotchas we've already hit live in [`CLAUDE.md`](./CLAUDE.md)**
— read that too before changing anything.

## Architecture — two layers

| Layer                     | Location      | Purpose                                                          |
| ------------------------- | ------------- | ---------------------------------------------------------------- |
| **Framework (read-only)** | `.faststore/` | Generated from `@faststore/core`. Replaced entirely on upgrades. |
| **Store customizations**  | `src/`        | All edits go here.                                               |

The CLI merges both at build time. On upgrade only `src/` survives.

Note that the CLI copies the whole of `src/` _into_ `.faststore/src/customizations/src/`.
Do not create a `src/customizations/` directory yourself — see CLAUDE.md, it is
the single most common way to make a component silently disappear.

## Store configuration

Everything environment-level is in `discovery.config.js`:

- **Account**: `arbonnepoc`, workspace `master`
- **Store URL**: `https://arbonnepoc.myvtex.com`
- **Content source**: Content Platform (`type: 'CP'`) — see CLAUDE.md for the
  `project` field, which is easy to get wrong and fails silently

Secrets belong in `vtex.env`, which is gitignored. Don't commit credentials.

## Dev commands

Yarn only. Node `>=20` locally; WebOps builds on Node `24` via
`experimental.nodeVersion`.

```bash
yarn dev           # http://localhost:3000, live data from the arbonnepoc account
yarn build         # production build
yarn start         # serve the production build locally
yarn cms-sync      # generate + upload the CMS schema (interactive — run it yourself)
yarn test          # Cypress E2E
yarn format        # prettier
```

## GraphQL and API extensions

FastStore exposes a GraphQL API over VTEX's Headless Commerce API. For data
outside the native schema, use API extensions:

- Extend via **`src/graphql/`** — never modify `.faststore/api/`. (Upstream docs
  say `src/customizations/src/graphql/`; that is the path _inside_ the generated
  tree, and writing it in the project would nest one level too deep. Same trap
  as the component registry.)
- **No direct calls to external APIs from components** — they cause `504`s. Use
  an API extension.
- **No custom Next.js API routes** beyond FastStore's built-ins.
- From resolvers, call your own store domain, not `vtexcommercestable` directly.
- Type generation runs on `yarn dev` and `yarn build`; schema changes only take
  effect after one of those.
- **Custom mutations work**: `extend type Mutation { ... }` in
  `src/graphql/vtex/typeDefs/*.graphql`, resolved from a `Mutation` key in
  `src/graphql/vtex/resolvers/index.ts`. See `arbAddComposedSet`.
- **Two generators, and the order matters.** `faststore generate-types` merges
  our typeDefs into `.faststore/@generated/schema.graphql`; only then can
  `graphql-codegen` validate documents against it. Running codegen first fails
  with `Unknown type "<YourInput>"`. `yarn dev` does both — invoking either by
  hand while it runs makes the watcher restart the server (~30s of connection
  refused, not a crash).
- `request` from `src/sdk/graphql/request` is
  `request<Query, Variables>(operation, variables)` and returns `data`, which
  may be `undefined`. Core's own `sdk/cart/index.ts` passes those generics the
  other way round; it is wrong, don't copy it.

### Overriding the PDP/PLP queries

Fragments in **`src/fragments/`** override core's stubs of the same name and
add fields to the built-in page queries.

- `usePDP` merges **`ServerProduct`** (SSR / `getStaticProps`) with
  **`ClientProduct`** (client SWR). Override _both_ or the page renders without
  your field until the client query resolves — a visible flash of the wrong
  layout, and wrong output for anything server-rendered.
- Ask only for what you need: fields whose resolvers hydrate other entities are
  charged on every product page.

## Static assets

`public/` is copied into the build by a filter that keeps only paths ending in
`json`, `txt`, `xml`, `ico`, `svg` — plus the literal `public`. `fs-extra`
applies that filter to **directories too** and does not recurse when it returns
false, so:

- **Subdirectories of `public/` are dropped entirely.** `public/flags/us.svg`
  never reaches the build even though `svg` is allowed. Keep assets flat:
  `public/flag-us.svg`.
- **`woff2` is not in the allowlist at all**, so self-hosted fonts under
  `public/fonts/` are unreachable in local dev and `@font-face` `url('/fonts/…')`
  404s. They are served in production by WebOps' edge, which is why this is easy
  to miss.

## Local dev vs deployed

WebOps' edge proxies paths that have no route in `yarn dev`:

| Path                                                | local             | deployed |
| --------------------------------------------------- | ----------------- | -------- |
| `/api/graphql`                                      | works             | works    |
| `/api/checkout/*`, `/api/sessions`, `/api/segments` | 404 (405 on POST) | 200      |

Unmatched `/api/*` falls through to the catch-all page, so the symptom is a CMS
`Content not found` for a slug like `api/checkout/pub/orderForm`, not a clean 404. Prefer doing platform calls in a resolver behind `/api/graphql` rather than
fetching those paths from the browser.

## CMS content types

Available out of the box:

| Content type                                    | Purpose                      |
| ----------------------------------------------- | ---------------------------- |
| `globalSections`                                | sections shared by all pages |
| `globalHeaderSections` / `globalFooterSections` | global header / footer       |
| `home`                                          | homepage structure and SEO   |
| `pdp` / `plp`                                   | product detail / listing     |
| `search`                                        | search results               |
| `landingPage`                                   | custom landing pages         |
| `login`, `404`, `500`                           | auth and error pages         |

## What not to do

- **Never edit `.faststore/`** — it is overwritten on upgrade.
- Don't add pages or components under `.faststore/`.
- Don't call external or VTEX REST APIs from components.
- Don't add custom Next.js API routes.
- Don't call `vtexcommercestable` from resolvers.
- Don't commit real credentials.

## Docs

- [FastStore overview](https://developers.vtex.com/docs/guides/faststore)
- [FastStore CLI](https://developers.vtex.com/docs/guides/faststore/getting-started-requirements)
- [Theming](https://developers.vtex.com/docs/guides/faststore/using-themes-overview)
- [Component overrides](https://developers.vtex.com/docs/guides/faststore/building-sections-component-customization-overview)
- [Extending the API](https://developers.vtex.com/docs/guides/faststore/api-extensions-overview)
- [FastStore Storefront coding rules](https://github.com/vtex/skills/blob/main/skills/faststore-storefront/SKILL.md)
  (applies to `contentSource` type `CP`, which is what this store uses)
