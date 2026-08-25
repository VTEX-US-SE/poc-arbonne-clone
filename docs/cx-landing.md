# Arbonne Beauty Consultant

The `[ARB] Beauty Consultant` CMS section provides the conversational product
discovery experience intended for the `/beauty-consultant` landing page.

## Weni configuration

Set these server-side values in `vtex.env` for local development and in WebOps
Settings for deployed environments:

```text
WENI_TOKEN=<Weni API token>
WENI_RECEIVE_URL=https://flows.weni.ai/c/<Arbonne channel>/receive
WENI_MESSAGES_URL=https://flows.weni.ai/api/v2/messages.json
```

`WENI_MESSAGES_URL` is optional and defaults to Weni's standard messages API.
Never expose these values through CMS fields or browser-side environment
variables.

The Arbonne flow should accept contact IDs beginning with the CMS-configured
prefix (`arb` by default). Catalog replies use Weni's `catalog_message` shape.
Each `product_retailer_info` entry should provide:

- `retailer_id`: VTEX SKU ID
- `seller_id`
- `name`
- `price`
- `image`
- `product_url`: a relative Arbonne PDP path, such as `/product-slug/p`

Only same-origin product URLs become clickable in the storefront.

## Content Platform setup

1. Run `yarn cms-sync` in an interactive terminal and enter `arbonne-poc` as
   the Content Platform store ID.
2. Create a Landing Page entry with slug and SEO path
   `/beauty-consultant`.
3. Add `[ARB] Beauty Consultant` as the first section and enable
   **Render immediately**.
4. Publish the entry after the Weni environment values and flow are ready.

The section suppresses the global header, mobile tab bar, and footer only while
it is mounted. Other storefront pages are unaffected.
