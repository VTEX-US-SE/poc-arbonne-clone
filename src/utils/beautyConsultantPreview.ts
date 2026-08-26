import type { AgentChatMessage } from '../components/BeautyConsultant/BeautyConsultant.types'

/** Query value: `/beauty-consultant?preview=shelf` */
export const BEAUTY_CONSULTANT_SHELF_PREVIEW = 'shelf'

/**
 * Static thread that mirrors a Weni `WeniWebChatCatalog` reply after
 * `parseAgentMessage` — used to review the product shelf without the agent.
 */
export function buildShelfPreviewThread(welcome: string): AgentChatMessage[] {
  return [
    { id: 'preview-welcome', direction: 'out', text: welcome },
    {
      id: 'preview-user',
      direction: 'in',
      text: 'My skin feels dry and dull',
    },
    {
      id: 'preview-agent',
      direction: 'out',
      text: 'For dry, dull skin, I would focus on deep hydration and barrier support — especially at night. Here are a few Arbonne favorites that pair well together.',
    },
    {
      id: 'preview-catalog',
      direction: 'out',
      text: '',
      header: 'Recommended for dry skin',
      products: [
        {
          sku: '3903',
          seller: '1',
          name: 'DermResults Advanced Moisturizer with Hyaluronic Acid',
          price: 64,
          image:
            'https://arbonnepoc.vtexassets.com/arquivos/ids/155424/3903_1.png.png?v=639221785340030000',
          url: '/dermresults-advanced-moisturizer-with-hyaluronic-acid-3903/p',
        },
        {
          sku: '3675',
          seller: '1',
          name: 'HydrateMe Nighttime Moisture Booster with Hyaluronic Acid',
          price: 53,
          image:
            'https://arbonnepoc.vtexassets.com/arquivos/ids/155453/3675_1.png.png?v=639221790454370000',
          url: '/hydrateme-nighttime-moisture-booster-with-hyaluronic-acid-3675/p',
        },
        {
          sku: '3680',
          seller: '1',
          name: 'HydrateMe Brilliant Eye Gel with Edulis Cellular Water',
          price: 55,
          image:
            'https://arbonnepoc.vtexassets.com/arquivos/ids/155451/3680_1.png.png?v=639221790192970000',
          url: '/hydrateme-brilliant-eye-gel-with-edulis-cellular-water-3680/p',
        },
        {
          sku: '6843',
          seller: '1',
          name: 'Arbonne Botaniques Vanilla Moisturizing Lip Balm',
          price: 17.1,
          image:
            'https://arbonnepoc.vtexassets.com/arquivos/ids/155407/6843_1.png.png?v=639221782302470000',
          url: '/arbonne-botaniques-vanilla-moisturizing-lip-balm-6843/p',
        },
      ],
    },
  ]
}
