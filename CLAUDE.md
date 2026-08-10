# arbonne-poc — FastStore project notes

FastStore storefront POC for VTEX account `arbonnepoc`, scaffolded from
`vtex-sites/starter.store`. Hosted via VTEX WebOps (not Vercel), GitHub repo
`brightdome/arbonne-poc`.

## CMS architecture

- `discovery.config.js` uses `contentSource: { type: 'CMS', project: 'arbonne-poc' }`
  — the **legacy** VBase-based CMS, not the newer Content Platform (`type: 'CP'`).
  CP was tried first and abandoned: it uploads to a separate schema registry
  that never surfaced in the WebOps-provisioned Headless CMS Admin screen.
- `project: 'arbonne-poc'` **must** match the CMS Store ID configured in
  VTEX Admin (Storefront > FastStore WebOps > project setup). If omitted,
  it silently defaults to `'faststore'`, which queries a different/empty
  CMS builder bucket and crashes `getStaticProps` (`page` resolves to
  `undefined`). Verify with:
  ```
  curl -s "https://arbonnepoc.myvtex.com/_v/cms/api/<project>/home"
  ```
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

- Use FastStore's design tokens instead of hardcoded values: `--fs-color-*`,
  `--fs-spacing-*`, `--fs-text-*`, `--fs-z-index-*`, `--fs-border-radius-*`
  (defined in `@faststore/ui/src/styles/base/tokens.scss`).
- Use the breakpoint mixin instead of raw media queries:
  ```scss
  @use '@faststore/ui/src/styles/base/utilities' as u;
  @include u.media('>=tablet') { ... }
  ```
  Breakpoints: `phone` (320px), `phonemid` (375px), `tablet` (768px),
  `notebook` (1280px), `desktop` (1440px).
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

## Build cache gotchas

`.faststore/` is a generated build cache/scaffold, regenerated from `src/` and
`discovery.config.js` on file changes. Its incremental watcher has missed
changes at least twice (a moved/renamed file, and the components registry
after a location fix) while every other file synced fine. If something in
`src/` isn't reflected in the running app and it's not an obvious code bug:
```
rm -rf .faststore
```
then restart `yarn dev`. Don't spend long debugging the watcher itself.

## Interactive commands need a real terminal

`yarn cms-sync`, `git push`, `vtex login`/`vtex use`, and anything needing
SSH/GPG passphrases or OAuth **must be run by the user in their own terminal**
(via the `!` prefix or directly) — not piped through the agent's Bash tool.
Piping answers (e.g. `printf 'yes\n' | yarn cms-sync`) has caused the CLI to
misinterpret stdin as a positional CLI argument, scaffolding a bogus project
into a literal `yes/` directory. If a command hangs on a prompt from the
agent's Bash tool, stop and hand it to the user instead of retrying with
piped input.
