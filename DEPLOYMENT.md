# Production deployment checklist

This app runs as two services: a static React storefront and a Node API. The local JSON database and local image uploads are for development only. Production requires MongoDB and Cloudinary; the API intentionally refuses to start without them. The root `render.yaml` defines both Render services and attaches `sridharmashasta.in` and `www.sridharmashasta.in` to the storefront.

## Deploy with Render

1. Push the reviewed project files to the connected GitHub repository, then create a new **Blueprint** in Render from that repository and select `render.yaml`.
2. Create a MongoDB Atlas database and database user. Add the connection string when Render prompts for `MONGODB_URI`. Allow network access from the API host in Atlas; keep the database user limited to this application.
3. Add the Cloudinary cloud name, API key, and API secret when Render prompts for them. Enter the admin email and a bcrypt password hash for `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`. Render generates `JWT_SECRET` automatically.
4. Review the Blueprint's service changes and deploy. Wait for the API health check and the storefront build to succeed.
5. In Render, follow the custom-domain verification instructions for `sridharmashasta.in` and `www.sridharmashasta.in`. Copy the exact DNS records Render shows into GoDaddy; do not guess values. The storefront API origin allowlist is already configured for both HTTPS domains.
6. After DNS and HTTPS are active, open `https://sridharmashasta.in`, verify products load, and sign in at `https://sridharmashasta.in/#/admin`.

Never put MongoDB, Cloudinary, or admin secrets into `frontend/.env`, a `VITE_` variable, chat messages, or committed files. Render's Blueprint prompts store these values in the API service's secret settings.

## 1. Prepare production services

Create:

- A managed MongoDB database and a database user limited to this application.
- A Cloudinary account for product and Tantri photos.
- A Node.js hosting service for `BACKEND/` and a static hosting service for `frontend/`. Use services that provide HTTPS and let you set environment variables.

Keep production credentials in the hosting provider's secret settings. Do not commit `.env` files or paste secrets into source code.

To change admin access, update `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in the API host's environment settings and redeploy. `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not the plain password. To generate one locally from `BACKEND/`, run `node -e "require('bcryptjs').hash('YOUR_NEW_PASSWORD', 12).then(console.log)"`, then save the output as the hash. Restart/redeploy the API after changing either value. Never put the plain admin password in a `VITE_` variable.

## 2. Deploy the API

Set the API service root to `BACKEND/`, install with `npm ci`, and start with `npm start`. Add these environment variables:

```text
NODE_ENV=production
MONGODB_URI=<production MongoDB connection string>
JWT_SECRET=<random secret with at least 32 characters>
ADMIN_EMAIL=<the admin sign-in email>
ADMIN_PASSWORD_HASH=<bcrypt hash of a unique strong admin password>
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
CLIENT_URL=https://<your-store-domain>
COUPON_CODE=SWAMI10
COUPON_PERCENT=10
SHIPPING_FEE=60
FREE_SHIPPING_ABOVE=999
```

The API host supplies `PORT`. `CLIENT_URL` may contain comma-separated HTTPS storefront origins if you use both `www` and the root domain. Set it to the final storefront origin(s), without a path or trailing slash. Check the service's `/api/health` URL after deployment.

Before using the production database, review the starter catalog and then run `npm run seed` from `BACKEND/` with the production database credentials. The seed only inserts missing products; it does not overwrite existing catalog records.

## 3. Deploy the storefront

Set the static site root to `frontend/`, install with `npm ci`, build with `npm run build`, and publish `dist/`. Set these build-time variables before building:

```text
VITE_API_URL=https://<your-api-domain>/api
```

The `VITE_` values are public and are compiled into the browser bundle. Never put a secret in a `VITE_` variable. Coupons and checkout shipping settings are served by the API, so changing the API's shipping values does not require rebuilding the storefront.

The API inserts the configured `COUPON_CODE` and `COUPON_PERCENT` once when it first starts against the production database. Admins can then manage that code and create additional coupons under **Admin → Coupons**. Customers enter coupon codes on the cart page, and the API checks the code and computes the discount at checkout.

## 4. Attach the GoDaddy domain

First add the purchased domain in your storefront host's custom-domain settings. The host will display the exact DNS records it expects. In GoDaddy, open **Domain Portfolio → your domain → DNS** and add those records. Commonly, the root (`@`) uses the A/ALIAS records given by the storefront host, while `www` uses a CNAME to the host-provided target. Do not guess an IP or CNAME target; use the values displayed by your host.

If you give the API its own hostname such as `api.yourdomain.com`, add that hostname to the API host first, then create the A or CNAME record its dashboard specifies. Update `VITE_API_URL` and the API's `CLIENT_URL` to match the final hostnames and redeploy/rebuild.

Leave existing MX, SPF, DKIM, and other email records in place. Changing or deleting them can interrupt domain email. DNS changes can take time to propagate. Once the host confirms the domain and issues its HTTPS certificate, use the HTTPS URL for the storefront and API. GoDaddy steps: [add an A record](https://www.godaddy.com/help/add-an-a-record-19238) and [add a CNAME record](https://www.godaddy.com/help/add-a-cname-record-19236).

## 5. Verify before announcing the site

- Open the root domain and `www` domain on desktop and mobile; confirm HTTPS works and there are no browser certificate warnings.
- Confirm products and Tantri photos load from production API/storage, and direct product links still open after refresh.
- Sign in to `/admin`; add, edit, and remove a temporary product, then verify the public catalog reflects the change.
- Upload one product photo and one Tantri gallery photo from a device; confirm each is visible on the storefront.
- Place a clearly identified low-value Cash on Delivery test order. Check that it appears in admin, the status history updates, the invoice downloads, and completed/cancelled orders can be archived. Cancel/archive the test order afterward.
- If you keep UPI enabled, verify a small payment manually in the payment account. The current UPI flow accepts a customer-entered transaction reference; it does not automatically confirm payment. Do not treat a submitted UTR as proof of payment.
- Check that the order notifications and Tantri booking links open the correct WhatsApp account and phone number in `frontend/src/config.js`.

## Current scope and launch dependencies

Tantri bookings are sent to WhatsApp and are not stored in the admin order list. UPI payments are reconciled manually; automated payment confirmation needs a payment gateway and verified webhook integration. The storefront does not currently manage inventory quantities. Confirm product availability and delivery promises before launch. A live site also depends on your hosting, database, Cloudinary account, admin credentials, business contact details, and final DNS values being configured correctly.
