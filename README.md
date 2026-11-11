# Sri Dharma Shasta

Devotional storefront for Ayyappa pooja kits and seva bookings. The project follows the split application structure used by the Dreamfarms reference: `frontend/` contains the React app and `BACKEND/` contains the API.

## Structure

```text
frontend/                   React 18 + Vite + Tailwind storefront and admin UI
  src/pages/Admin.jsx        Password-protected catalog and order dashboard
  src/context/AppContext.jsx Shared storefront catalog/cart state
BACKEND/
  src/config/                MongoDB connection
  src/controllers/           (Reserved for extracted route controllers)
  src/middleware/            Authentication
  src/models/                MongoDB Product, Order, and site settings schemas
  src/routes/api.js          Public catalog/checkout and protected admin API
  src/seeds/                 Catalog bootstrap script
```

## Local development

1. Install Node.js 20 or newer. In `BACKEND/`, run `npm ci` and `npm run dev`.
2. Without a `.env`, development mode starts with a persistent local JSON database at `BACKEND/data/store.json`, seeds the starter catalog on first run, and stores device uploads under `BACKEND/uploads/`. These local data folders are ignored by git.
3. Open another terminal, run `npm ci` and `npm run dev` from `frontend/`, then open the Vite URL. The admin dashboard is at `/#/admin`.
4. Local admin sign-in: `admin@localhost` / `SdsLocalAdmin!2026`. This development-only password must never be used on a public deployment.
5. Optional: configure MongoDB and Cloudinary via `BACKEND/.env.example` if you want to exercise those production integrations locally.

Set `VITE_API_URL` to the deployed API base URL (including `/api`) when building the frontend. Checkout writes orders to MongoDB and rejects invalid or unavailable items. In the admin panel, add and edit products, upload product photos from your device, set the Tantri profile photo, upload a Tantri/seva gallery, and update order status. Images are validated and stored in Cloudinary; the profile photo is shown on the storefront home and Tantri pages, while gallery photos appear on the Tantri page. Removing a product archives it so existing order records remain intact. Device image uploads accept JPG, PNG, and WebP files up to 5 MB each; the gallery supports up to 20 photos.

## Production deployment

- Deploy the API and frontend separately; configure production `NODE_ENV=production`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `VITE_API_URL` as platform secrets/environment variables. Production startup intentionally refuses to use the local store or omit required database, auth, and image-storage settings.
- Use HTTPS, a managed MongoDB deployment with backups, restricted database credentials, and an origin allowlist containing only the deployed frontend origin.
- Build the storefront with `npm run build` from `frontend/` and publish `frontend/dist`. Start the API with `npm start` from `BACKEND/`.
- Seed the catalog against the production database only after reviewing the records; the seed uses insert-only updates and does not overwrite existing catalog changes.
- UPI transaction references are stored for manual reconciliation. They are not proof of payment; verify transfers with the payment provider before fulfillment. Automated UPI verification requires a payment gateway integration and signed webhook handling.

The project is deployment-configurable, but live production readiness still depends on supplying valid secrets, a database, hosting, and a payment provider configuration. Do not use real customer orders until those services are configured and verified.
