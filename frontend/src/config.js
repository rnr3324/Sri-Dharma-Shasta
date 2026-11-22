// Edit these values to match your business.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
if (import.meta.env.PROD && (!configuredApiUrl || !/^https:\/\//i.test(configuredApiUrl) || /localhost|127\.0\.0\.1/i.test(configuredApiUrl))) {
  throw new Error('Set VITE_API_URL to the HTTPS production API URL before building the storefront.')
}
const apiBaseUrl = configuredApiUrl || 'http://127.0.0.1:4000'
export const API_URL = /\/api$/i.test(apiBaseUrl) ? apiBaseUrl : `${apiBaseUrl}/api`

export const CONFIG = {
  phone: '+91 8332993221',
  whatsapp: '918332993221', // country code + number, no + or spaces
  upiId: 'naveenkumarnandi3@ybl',
  upiName: 'NANDI NAVEEN KUMAR',
  shipping: Number(import.meta.env.VITE_SHIPPING_FEE ?? 60),
  freeShippingAbove: Number(import.meta.env.VITE_FREE_SHIPPING_ABOVE ?? 999),
  maxOrderQuantity: 20,
}
