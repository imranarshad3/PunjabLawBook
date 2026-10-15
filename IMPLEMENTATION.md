# Punjab Law Book House homepage

Local implementation only. Nothing has been deployed or published.

## Revised references shhssjjj

The later `images_missing` upload supersedes three original sections:

- `image copy 2.png`: Featured Categories — left-aligned heading, five photographic cards, pale icon discs and outlined actions.
- `image copy 3.png`: Bestsellers — ivory photographic header, subject navigation to real store collections, four-card desktop carousel with working previous/next controls, green cart and light WhatsApp actions.
- `image copy.png`: Why Choose Us — large left-hand photograph, right-hand heading and four service cards, overlapping lower information panel. Chosen over `image.png` after the user delegated the choice; it avoids that alternate layout's promotion and institution-endorsement strip. Unverified statistics are replaced with factual catalogue and support links.

These replace the existing sections; no additional section or duplicate trust strip was added. New photographs are extracted only from the corresponding updated reference. All product data remains sourced from the real store.

The subsequently supplied individual images further supersede Bestsellers and Judicial Examination:

- Most Popular: angled emerald editorial banner, photographic scenes for the four matching real catalogue products, compact green/outlined product actions. Supplied review stars and counts are deliberately omitted because they are unverified. The fifth carousel product retains its original store cover.
- Judicial Examination: emerald/ivory composition, centered approved promotional artwork, gold/white headline and three verified guide features. The real product API includes only a cover, so the secondary action is truthfully labeled **Request Sample Pages** and opens a WhatsApp enquiry; it does not invent a sample download.
- Navigation polish: refined brand emblem and masthead, desktop Bookshop dropdown, search focus treatment and a redesigned mobile menu. All links use the original store or real homepage anchors. Escape closes menus and returns focus to their trigger.

## Preview and checks

Use Node.js 22+ (validated with Node.js 24.21.0).

```sh
npm install --include=optional
npm run dev
npm run lint
npm run typecheck
npm run build
```

The homepage is at http://localhost:3000. Existing unrelated routes were not changed; the repository initially contained only the default Next.js homepage. The installed Next.js 16.4 documentation was consulted for server/client boundaries, images, fonts, and routing. System serif/sans fonts avoid third-party font requests.

## Sources and content boundaries

- Visual layout: the twelve numbered PNGs in the supplied implementation kit. Each section is rendered once in numerical order with accessible HTML. Photographic areas were extracted as compressed WebP details, not used as screenshots of page layouts. Decorative artwork is illustrative; product cards exclusively use actual store cover images.
- Product data: https://punjablawbookhouse.com/wp-json/wc/store/v1/products. `src/data/catalogue.json` records the verification date, source URLs, prices, availability, and original image URLs. Six featured titles are selected from products on the live homepage; the separate bestseller set uses the store API popularity order.
- Contact, address and WhatsApp number: https://punjablawbookhouse.com/ and https://punjablawbookhouse.com/contact-us/. WhatsApp number verified against the live site WhatsApp widget configuration.
- Service descriptions: https://punjablawbookhouse.com/about-us/. No shipping price, delivery-time promise, fabricated sales count, review, rating, discount, or payment-provider badge has been added.
- Real catalogue titles and author credits are lightly normalized for readability in `book-card.tsx`; full source titles remain in the data and image descriptions.

Refresh products and optimized local covers from the repository root with `python3 scripts/prepare-catalogue.py` (Pillow required). Prices and stock are a dated snapshot, not a live synchronization. Recheck before publication. Final prices and availability are controlled by the original store.

## Functionality

- Search submits the book query to the existing store.
- Add to Cart on featured cards switches to a quantity stepper; "Continue to cart" opens the original WooCommerce cart with the real product ID and chosen quantity. Bestseller cards link straight to the store cart. The original store handles session cookies, authentication, checkout, stock checks and payment. No local cart count is invented.
- WhatsApp opens an enquiry addressed to the verified number with the actual product URL; the user sends the message.
- Book hearts toggle saves for the current page visit only, with explicit accessible labels and pressed states. They do not synchronize to a store account.
- Mobile navigation opens/closes and closes on section selection or Escape inside the menu.
- Reviews have clearly labeled preview cards pending verified customer content.
- Newsletter input and button are disabled and explain that no email is collected. A real mailing-list integration and consent/privacy handling are still required before enabling signup.
- Preview metadata is `noindex, nofollow` intentionally. Enable indexing only when the preview content is replaced and publication is approved.

## Browser validation

`scripts/check-homepage.cjs` checks 320, 375, 768, 1024, 1440 and 1920 px: section uniqueness/order, one H1, horizontal overflow, broken loaded images, featured-card cart and WhatsApp actions on one row, mobile navigation, save toggles, genuine destinations, and disabled newsletter state. Screenshots and results are saved under `/tmp/plbh-checks` by default.

Run with an available Playwright installation (`PLAYWRIGHT_MODULE` can point to its absolute module path); set `AXE_PATH` to an installed `axe-core/axe.min.js` to include WCAG checks. `CHECK_URL` can point to the production preview. The test never submits orders, sends messages, or changes the live store.
