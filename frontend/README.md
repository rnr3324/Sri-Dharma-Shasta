# Sri Dharma Shasta

Ayyappa Swamy pooja kits, sevas and Tantri bookings. React 18 + Vite + Tailwind CSS 3, in 7 languages.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs ./dist
npm run preview
```

## Folder structure
```
public/            landing-mandala.webp, hero-ayyappa.jpg (+ add products/ photos here)
src/
  config.js        phone, WhatsApp, UPI ID, shipping, coupon  <- edit first
  App.jsx          routes (HashRouter, works on any static host)
  context/         AppContext: language, cart, orders (saved in localStorage)
  data/            content.js, products.js, i18n.js
  components/      Header, Footer, Layout, Modal, ProductCard, ProductModal, Qty, ProductImage
  pages/           Splash, LanguageSelect, Home, Store, Tantri, Cart, Done
  utils/helpers.js WhatsApp + UPI links, navigation helper
```

## Deploy (any one)
- **Vercel / Netlify / Cloudflare Pages:** push to GitHub, import the repo. Build command `npm run build`, output directory `dist`.
- **GitHub Pages:** run `npm run build`, publish the `dist` folder (relative paths are already configured).
- **Any hosting:** upload the contents of `dist`.

## Customise
- **Products, prices, categories, kit contents:** `src/data/products.js`. Photos: add files to `public/products/` and map ids in `IMAGES`.
- **Translations:** add rows to `src/data/i18n.js` (English text -> hi, kn, ml, ta, te). Long paragraphs are still English.
- **Business details:** `src/config.js`.

## Important notes
- Orders and bookings are sent to you only through the WhatsApp button the customer taps. There is no backend or database.
- UPI payments are **not verified automatically**. Check the transaction ID in your PhonePe app before dispatch. Automatic verification needs a payment gateway plus a server.
- Prices, shipping, coupon, stock text and policy pages are placeholders. Review before launch.
