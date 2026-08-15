module.exports = {
  contentSource: {
    type: 'CP',
    project: 'arbonne-poc',
  },
  seo: {
    title: 'Arbonne',
    description: 'Arbonne FastStore POC',
    titleTemplate: '%s | Arbonne',
    author: 'Arbonne',
  },

  theme: 'custom-theme',

  platform: 'vtex',

  api: {
    storeId: 'arbonnepoc',
    workspace: 'master',
    environment: 'vtexcommercestable',
    hideUnavailableItems: true,
    incrementAddress: false,
  },

  session: {
    currency: {
      code: 'USD',
      symbol: '$',
    },
    locale: 'en-US',
    channel: '{"salesChannel":"1","regionId":""}',
    country: 'USA',
    deliveryMode: null,
    addressType: null,
    postalCode: null,
    geoCoordinates: null,
    person: null,
  },

  cart: {
    id: '',
    items: [],
    messages: [],
    shouldSplitItem: true,
  },

  storeUrl: 'https://arbonne.b2cdemostore.com',
  secureSubdomain: 'https://arbonne.b2cdemostore.com/',
  checkoutUrl: 'https://arbonne.b2cdemostore.com/checkout',
  loginUrl: 'https://arbonne.b2cdemostore.com/api/io/login',
  accountUrl: 'https://arbonne.b2cdemostore.com/api/io/account',

  previewRedirects: {
    home: '/',
    plp: '/headphones',
    search: '/s?q=Newstore',
    pdp: '/headphone-white-10000006/p',
  },

  lighthouse: {
    server: process.env.BASE_SITE_URL || 'http://localhost:3000',
    pages: {
      home: '/',
      pdp: '/headphone-white-10000006/p',
      collection: '/headphones',
    },
  },

  cypress: {
    pages: {
      home: '/',
      pdp: '/headphone-white-10000006/p',
      collection: '/headphones',
      collection_filtered:
        '/headphones?category-1=headphones&fuzzy=0&operator=and&facets=category-1%2Cfuzzy%2Coperator&sort=score_desc&page=0',
      search: '/s?q=Newstore',
    },
    browser: 'electron',
  },

  analytics: {
    gtmContainerId: null,
  },

  experimental: {
    nodeVersion: 24,
    cypressVersion: 12,
    enableFaststoreMyAccount: false,
    optimizedFonts: true,
  },

  vtexHeadlessCms: {
    webhookUrls: [
      'https://arbonnepoc.myvtex.com/cms-releases/webhook-releases',
    ],
  },
}
