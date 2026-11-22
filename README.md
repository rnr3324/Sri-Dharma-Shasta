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

1. Install Node.js 20 or newer. Create `BACKEND/.env` with `NODE_ENV=development`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`. Leave `MONGODB_URI` unset to use the local store. Then run `npm ci` and `npm run dev` in `BACKEND/`.
2. Without a `.env`, development mode starts with a persistent local JSON database at `BACKEND/data/store.json`, seeds the starter catalog on first run, and stores device uploads under `BACKEND/uploads/`. These local data folders are ignored by git.
3. Open another terminal, run `npm ci` and `npm run dev` from `frontend/`, then open the Vite URL. The admin dashboard is at `/#/admin`.
4. Sign in at `/#/admin` with the `ADMIN_EMAIL` and password used to create `ADMIN_PASSWORD_HASH`. Keep `.env` local and use separate production credentials in your hosting provider.
5. Optional: configure MongoDB and Cloudinary via `BACKEND/.env.example` if you want to exercise those production integrations locally.

Set `VITE_API_URL` to the deployed API base URL (including `/api`) when building the frontend. Checkout writes orders to MongoDB and rejects invalid or unavailable items. In the admin panel, add and edit products, upload product photos from your device, set the Tantri profile photo, upload a Tantri/seva gallery, and update order status. Images are validated and stored in Cloudinary; the profile photo is shown on the storefront home and Tantri pages, while gallery photos appear on the Tantri page. Removing a product archives it so existing order records remain intact. Device image uploads accept JPG, PNG, and WebP files up to 5 MB each; the gallery supports up to 20 photos.

Orders require an exact 10-digit customer phone number. Admins can create, edit, activate, and deactivate coupon codes under **Admin → Coupons**. Customers enter coupon codes on the cart page, and the API validates each code again at checkout.

## Production deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full launch checklist and GoDaddy DNS steps.

The root [`render.yaml`](render.yaml) defines the Render API and storefront services. It uses MongoDB Atlas for persistent data, Cloudinary for image uploads, and the `sridharmashasta.in` domain for the storefront. Render prompts for the private database, admin, and Cloudinary values during Blueprint setup; never commit them to this repository.

- Deploy the API and frontend separately; configure backend environment variables and secrets, plus the public frontend build setting `VITE_API_URL`. Production startup intentionally refuses to use the local store or omit required database, auth, image-storage, and origin settings.
- Use HTTPS, a managed MongoDB deployment with backups, restricted database credentials, and an origin allowlist containing only the deployed frontend origin.
- Build the storefront with `npm run build` from `frontend/` and publish `frontend/dist`. Start the API with `npm start` from `BACKEND/`.
- Seed the catalog against the production database only after reviewing the records; the seed uses insert-only updates and does not overwrite existing catalog changes.
- UPI transaction references are stored for manual reconciliation. They are not proof of payment; verify transfers with the payment provider before fulfillment. Automated UPI verification requires a payment gateway integration and signed webhook handling.

The project is deployment-configurable, but live production readiness still depends on supplying valid secrets, a database, hosting, and a payment provider configuration. Do not use real customer orders until those services are configured and verified.
