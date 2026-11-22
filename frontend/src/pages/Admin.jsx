import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { asset } from '../utils/helpers'
import { downloadInvoice } from '../utils/invoice'
import { API_URL } from '../config'

const API = API_URL
const blank = { name: '', price: '', cat: 'Pooja items', icon: '🪔', desc: '', img: '', includes: [] }
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function Admin() {
  const { setProducts, site, setSite, setCoupons } = useApp()
  const [token, setToken] = useState(() => sessionStorage.getItem('sds-admin-token') || '')
  const [login, setLogin] = useState({ email: '', password: '' })
  const [data, setData] = useState(null)
  const [couponRecords, setCouponRecords] = useState([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('overview')
  const [couponError, setCouponError] = useState('')

  const request = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.message || 'Request failed')
    return body
  }
  const refresh = async () => {
    const [overview, catalog, settings, couponList] = await Promise.all([request('/admin/overview'), fetch(`${API}/products`).then((r) => r.json()), fetch(`${API}/site`).then((r) => r.json()), request('/admin/coupons')])
    setData(overview)
    setProducts(catalog)
    setSite(settings)
    setCouponRecords(couponList)
    setCoupons(couponList.filter((coupon) => coupon.active))
  }
  useEffect(() => {
    if (token) refresh().catch((e) => {
      setError(e.message)
      if (e.message.includes('Session')) { sessionStorage.removeItem('sds-admin-token'); setToken('') }
    })
  }, [token])

  const signIn = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const r = await fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      sessionStorage.setItem('sds-admin-token', d.token); setToken(d.token)
    } catch (e2) { setError(e2.message) } finally { setBusy(false) }
  }
  const uploadImages = async (kind, fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return []
    const body = new FormData()
    files.forEach((file) => body.append('images', file))
    const res = await fetch(`${API}/admin/uploads/${kind}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Image upload failed')
    return data.images
  }
  const persistSite = async (next) => { const saved = await request('/admin/site', { method: 'PUT', body: JSON.stringify(next) }); setSite(saved) }
  const saveProduct = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      await request(editing ? `/admin/products/${editing}` : '/admin/products', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, price: Number(form.price) }) })
      setForm(blank); setEditing(null); await refresh(); return true
    } catch (e2) { setError(e2.message); return false } finally { setBusy(false) }
  }
  const edit = (p) => { setEditing(p.id); setForm({ name: p.name, price: p.price, cat: p.cat, icon: p.icon, desc: p.desc || '', img: p.img || '', includes: p.includes || [] }); setTab('products') }
  const remove = async (id) => { if (!window.confirm('Remove this product from the storefront?')) return; try { await request(`/admin/products/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { setError(e.message) } }
  const status = async (id, value) => { try { await request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: value }) }); await refresh() } catch (e) { setError(e.message) } }
  const archiveOrder = async (order) => {
    if (!window.confirm(`Remove order ${order.ref} from the active order list? It will be archived and can be recovered from the database.`)) return
    try { await request(`/admin/orders/${order._id}`, { method: 'DELETE' }); await refresh() } catch (e) { setError(e.message) }
  }
  const saveCoupon = async (form, id) => {
    setCouponError('')
    try {
      await request(id ? `/admin/coupons/${id}` : '/admin/coupons', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(form) })
      await refresh()
    } catch (e) { setCouponError(e.message); throw e }
  }
  const setCouponActive = async (coupon, active) => {
    setCouponError('')
    try { await request(`/admin/coupons/${coupon._id}`, { method: 'PATCH', body: JSON.stringify({ active }) }); await refresh() }
    catch (e) { setCouponError(e.message) }
  }
  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Deactivate coupon ${coupon.code}?`)) return
    setCouponError('')
    try { await request(`/admin/coupons/${coupon._id}`, { method: 'DELETE' }); await refresh() }
    catch (e) { setCouponError(e.message) }
  }
  const signOut = () => { sessionStorage.removeItem('sds-admin-token'); setToken(''); setData(null) }

  if (!token) return <main className="grid min-h-screen place-items-center bg-[#100b09] px-5"><form onSubmit={signIn} className="w-full max-w-md rounded-3xl border border-gold/30 bg-coal p-8 shadow-2xl"><a href="#/home" className="text-sm text-gold2">← Storefront</a><p className="mt-8 text-xs tracking-[.25em] text-gold">SRI DHARMA SHASTA</p><h1 className="mt-2 text-3xl">Admin sign in</h1><p className="mt-2 text-mute">Manage products, Tantri photos, and customer orders.</p><label className="label">Username</label><input className="field" type="text" autoComplete="username" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /><label className="label">Password</label><input className="field" type="password" autoComplete="current-password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />{error && <p className="mt-3 text-red-300">{error}</p>}<button disabled={busy} className="btn mt-6 w-full">{busy ? 'Signing in…' : 'Sign in securely'}</button></form></main>

  return <main className="min-h-screen overflow-x-hidden bg-[#100b09] text-cream"><header className="border-b border-gold/20 bg-ink px-4 py-4 sm:px-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-[.2em] text-gold">SRI DHARMA SHASTA</p><h1 className="text-xl sm:text-2xl">Admin dashboard</h1></div><div className="flex gap-2"><a href="#/home" className="ghost px-3 sm:px-5">View store</a><button onClick={signOut} className="ghost px-3 sm:px-5">Sign out</button></div></div></header><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7">{error && <div className="mb-4 rounded-lg border border-red-400/40 bg-red-900/20 p-3 text-red-200">{error}</div>}<nav className="scrollbar-hide mb-7 flex gap-2 overflow-x-auto pb-2">{[['overview', 'Overview'], ['products', 'Products'], ['tantri', 'Tantri photos'], ['orders', 'Orders'], ['coupons', 'Coupons']].map(([v, label]) => <button key={v} onClick={() => setTab(v)} className={`shrink-0 rounded-full px-4 py-2 sm:px-5 ${tab === v ? 'bg-gold text-ink' : 'border border-gold/30 text-gold2'}`}>{label}</button>)}</nav>
    {tab === 'overview' && data && <><div className="grid gap-4 sm:grid-cols-3">{[['Active products', data.products], ['Orders received', data.orders], ['Order value', money(data.sales)]].map(([label, value]) => <div className="rounded-2xl border border-gold/20 bg-coal p-5" key={label}><p className="text-sm text-mute">{label}</p><p className="mt-2 font-sans text-3xl tabular-nums text-gold2">{value}</p></div>)}</div><h2 className="mb-4 mt-9 text-xl">Latest orders</h2><OrderList orders={data.recent?.slice(0, 5) || []} onStatus={status} onInvoice={downloadInvoice} onArchive={archiveOrder} /></>}
    {tab === 'products' && <ProductsPanel products={data?.allProducts || []} form={form} setForm={setForm} editing={editing} setEditing={setEditing} onSave={saveProduct} onEdit={edit} onRemove={remove} uploadImages={uploadImages} busy={busy} setBusy={setBusy} setError={setError} />}
    {tab === 'tantri' && <TantriPhotos site={site} persistSite={persistSite} uploadImages={uploadImages} busy={busy} setBusy={setBusy} setError={setError} />}
    {tab === 'orders' && <OrderManagement orders={data?.recent || []} onStatus={status} onInvoice={downloadInvoice} onArchive={archiveOrder} />}
    {tab === 'coupons' && <CouponsPanel coupons={couponRecords} error={couponError} onSave={saveCoupon} onSetActive={setCouponActive} onDelete={deleteCoupon} />}
  </div></main>
}

function ProductsPanel({ products, form, setForm, editing, setEditing, onSave, onEdit, onRemove, uploadImages, busy, setBusy, setError }) {
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (editing) setFormOpen(true)
  }, [editing])

  const filtered = products.filter((product) => [product.name, product.cat, product.desc].filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const resetForm = () => { setEditing(null); setForm(blank); setFormOpen(false) }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Products</h2>
          <p className="mt-1 font-sans text-sm text-mute">Manage product photos, descriptions, categories, and prices.</p>
        </div>
        <button className="btn min-h-11 px-5" type="button" onClick={() => { setEditing(null); setForm(blank); setFormOpen((open) => !open) }}><span className="lg:hidden">{formOpen ? 'Close form' : '+ Add product'}</span><span className="hidden lg:inline">+ Add product</span></button>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <form onSubmit={async (event) => { if (await onSave(event)) setFormOpen(false) }} className={`${formOpen ? 'block' : 'hidden'} order-1 h-fit rounded-2xl border border-gold/25 bg-gradient-to-b from-[#211814] to-coal p-4 shadow-lg sm:p-6 lg:sticky lg:top-5 lg:order-2 lg:block`}>
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-xl">{editing ? 'Edit product' : 'Add a product'}</h3><p className="mt-1 font-sans text-xs text-mute">Fields marked required must be filled.</p></div>
            {formOpen && <button type="button" aria-label="Close product form" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 font-sans text-xl text-gold2 lg:hidden" onClick={resetForm}>×</button>}
          </div>

          <label className="label">Product name</label>
          <input required maxLength="120" className="field font-sans text-sm" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <div><label className="label">Price (₹)</label><input required min="0" step="1" type="number" inputMode="numeric" className="field font-sans tabular-nums" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></div>
            <div><label className="label">Category</label><input required maxLength="60" className="field font-sans text-sm" value={form.cat} onChange={(event) => setForm({ ...form, cat: event.target.value })} /></div>
          </div>

          <label className="label">Description</label>
          <textarea maxLength="2000" className="field font-sans text-sm leading-6" rows="4" value={form.desc} onChange={(event) => setForm({ ...form, desc: event.target.value })} />

          <label className="label">What's included <span className="font-sans text-xs text-mute">(one item per line)</span></label>
          <textarea maxLength="1200" className="field font-sans text-sm leading-6" rows="3" value={form.includes.join('\n')} onChange={(event) => setForm({ ...form, includes: event.target.value.split('\n').filter((line) => line.trim()) })} />

          <label className="label">Product photo</label>
          <input aria-label="Choose product photo from device" className="field cursor-pointer font-sans text-xs file:mr-2 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-2 file:font-semibold file:text-ink" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async (event) => { try { setBusy(true); const [image] = await uploadImages('products', event.target.files); if (image) setForm((current) => ({ ...current, img: image })) } catch (error) { setError(error.message) } finally { setBusy(false); event.target.value = '' } }} />
          {form.img ? <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold/15 bg-black/15 p-2.5"><img src={asset(form.img)} alt="Product photo preview" className="h-20 w-20 shrink-0 rounded-lg bg-ink object-contain p-1" /><div className="min-w-0 flex-1"><p className="font-sans text-sm text-gold2">Photo selected</p><p className="font-sans text-xs text-mute">JPG, PNG, or WebP · maximum 5 MB</p></div><button type="button" className="min-h-10 rounded-full border border-gold/30 px-3 font-sans text-xs text-gold2 hover:bg-gold/10" onClick={() => setForm({ ...form, img: '' })}>Remove</button></div> : <p className="mt-2 font-sans text-xs text-mute">JPG, PNG, or WebP · maximum 5 MB</p>}

          <label className="label">Fallback icon</label>
          <input aria-label="Fallback icon" maxLength="8" className="field font-sans" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} />

          <div className="mt-5 flex gap-2">
            <button disabled={busy} className="btn min-h-11 flex-1">{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
            {editing && <button type="button" className="ghost min-h-11" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="order-2 min-w-0 lg:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-sans text-sm font-semibold text-gold2">Product list <span className="ml-1 rounded-full bg-gold/10 px-2 py-0.5 font-sans text-xs tabular-nums text-gold2">{filtered.length}{query ? ` / ${products.length}` : ''}</span></h3>
          </div>
          <label className="mb-3 block"><span className="sr-only">Search products</span><input type="search" className="field font-sans text-sm" placeholder="Search by product or category…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>

          <div className="space-y-3">
            {filtered.map((product) => (
              <article key={product.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-gold/15 bg-coal p-3 transition hover:border-gold/40 sm:gap-4 sm:p-4">
                {product.img ? <img src={asset(product.img)} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg border border-gold/10 bg-ink object-contain p-1 sm:h-20 sm:w-20" /> : <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-ink text-3xl sm:h-20 sm:w-20">{product.icon || '🪔'}</span>}
                <div className="min-w-0 flex-1">
                  <h4 className="break-words font-display text-sm leading-snug text-cream sm:text-base">{product.name}</h4>
                  <p className="mt-1 truncate font-sans text-xs text-mute">{product.cat}</p>
                  <p className="mt-1 font-sans text-sm font-semibold tabular-nums text-gold2">{money(product.price)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button className="min-h-10 rounded-full border border-gold/35 px-3 font-sans text-xs text-gold2 hover:bg-gold/10 sm:px-4 sm:text-sm" onClick={() => onEdit(product)}>Edit</button>
                  <button className="min-h-10 rounded-full border border-red-400/35 px-3 font-sans text-xs text-red-200 hover:bg-red-400/10 sm:px-4 sm:text-sm" onClick={() => onRemove(product.id)}>Remove</button>
                </div>
              </article>
            ))}
            {!filtered.length && <div className="rounded-xl border border-dashed border-gold/25 bg-coal px-4 py-10 text-center"><p className="font-sans text-sm text-mute">{products.length ? 'No products match your search.' : 'No products have been added yet.'}</p></div>}
          </div>
        </div>
      </div>
    </section>
  )
}

function CouponsPanel({ coupons, error, onSave, onSetActive, onDelete }) {
  const [form, setForm] = useState({ code: '', percent: 10 })
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await onSave({ code: form.code.trim().toUpperCase(), percent: Number(form.percent) }, editing)
      setForm({ code: '', percent: 10 }); setEditing(null); setMessage('Coupon saved. Active coupons are now available on the customer cart page.')
    } catch { /* The admin page displays the API validation message. */ }
    finally { setBusy(false) }
  }
  return <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div><h2 className="mb-4 text-2xl">Manage coupons</h2>{error && <p className="mb-4 rounded-lg border border-red-400/40 bg-red-900/20 p-3 text-red-200">{error}</p>}{message && <p className="mb-4 rounded-lg border border-green-400/30 bg-green-900/20 p-3 text-green-200">{message}</p>}<div className="space-y-3">{coupons.map((coupon) => <article key={coupon._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/20 bg-coal p-4"><div><p className="font-sans font-semibold tracking-wider text-gold2">{coupon.code}</p><p className="font-sans tabular-nums text-sm text-mute">{coupon.percent}% off · {coupon.active ? 'Active' : 'Inactive'}</p></div><div className="flex gap-2"><button className="ghost !px-3 !py-1" onClick={() => { setEditing(coupon._id); setForm({ code: coupon.code, percent: coupon.percent }); setMessage('') }}>Edit</button><button className="ghost !px-3 !py-1" onClick={() => onSetActive(coupon, !coupon.active)}>{coupon.active ? 'Deactivate' : 'Activate'}</button>{coupon.active && <button className="ghost !px-3 !py-1" onClick={() => onDelete(coupon)}>Remove</button>}</div></article>)}{!coupons.length && <p className="rounded-xl border border-dashed border-gold/30 p-8 text-center text-mute">No coupons yet. Add one to show it on the customer cart page.</p>}</div></div><form onSubmit={submit} className="h-fit rounded-2xl border border-gold/20 bg-coal p-5"><h2 className="text-xl">{editing ? 'Edit coupon' : 'Create coupon'}</h2><label className="label">Coupon code</label><input required minLength={3} maxLength={24} pattern="[A-Za-z0-9_-]{3,24}" className="field font-sans uppercase" placeholder="e.g. AYYAPPA15" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /><p className="mt-1 text-xs text-mute">3–24 letters, numbers, hyphens, or underscores.</p><label className="label">Discount percentage</label><input required type="number" min="1" max="90" step="1" className="field font-sans tabular-nums" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} /><div className="mt-5 flex gap-2"><button disabled={busy} className="btn flex-1">{busy ? 'Saving…' : editing ? 'Save changes' : 'Create coupon'}</button>{editing && <button type="button" className="ghost" onClick={() => { setEditing(null); setForm({ code: '', percent: 10 }) }}>Cancel</button>}</div></form></section>
}

function TantriPhotos({ site, persistSite, uploadImages, busy, setBusy, setError }) {
  const uploadProfile = async (files) => {
    try { setBusy(true); const [url] = await uploadImages('tantri', files); if (url) await persistSite({ ...site, tantriProfileImage: url }) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const uploadGallery = async (files) => {
    try { setBusy(true); const remaining = 20 - site.tantriGallery.length; const selected = Array.from(files || []).slice(0, remaining); const urls = await uploadImages('tantri', selected); if (urls.length) await persistSite({ ...site, tantriGallery: [...site.tantriGallery, ...urls] }) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const removePhoto = async (url) => { try { await persistSite({ ...site, tantriGallery: site.tantriGallery.filter((photo) => photo !== url) }) } catch (e) { setError(e.message) } }
  return <section className="space-y-7"><div className="rounded-2xl border border-gold/20 bg-coal p-5 sm:p-7"><h2 className="text-xl">Tantri profile photo</h2><p className="mt-1 text-sm text-mute">Shown on the home page and Tantri booking page.</p><div className="mt-5 flex flex-wrap items-center gap-5"><img src={asset(site.tantriProfileImage)} alt="Current Tantri profile" className="h-40 w-32 rounded-xl border border-gold/30 object-cover object-top" /><label className="ghost cursor-pointer">{busy ? 'Uploading…' : 'Choose photo from device'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => { uploadProfile(e.target.files); e.target.value = '' }} /></label><span className="text-xs text-mute">JPG, PNG, or WebP · maximum 5 MB</span></div></div><div className="rounded-2xl border border-gold/20 bg-coal p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl">Tantri &amp; seva gallery</h2><p className="mt-1 text-sm text-mute">These photos appear on the public Tantri page. Up to 20 images.</p></div><label className="btn cursor-pointer">{busy ? 'Uploading…' : 'Add photos'}<input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy || site.tantriGallery.length >= 20} onChange={(e) => { uploadGallery(e.target.files); e.target.value = '' }} /></label></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{site.tantriGallery.map((url) => <div key={url} className="group relative"><img src={asset(url)} alt="Tantri gallery" className="aspect-square w-full rounded-xl object-cover" /><button onClick={() => removePhoto(url)} className="absolute right-2 top-2 rounded-full bg-black/75 px-3 py-1 text-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100">Remove</button></div>)}</div>{!site.tantriGallery.length && <p className="mt-5 rounded-xl border border-dashed border-gold/30 p-8 text-center text-sm text-mute">No gallery photos uploaded yet.</p>}</div></section>
}

function OrderManagement({ orders, onStatus, onInvoice, onArchive }) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const filtered = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const when = order.createdAt ? new Date(order.createdAt) : null
    const searchText = [order.ref, order.customer?.name, order.customer?.phone, order.customer?.email, order.customer?.address, order.customer?.pin, order.pay, order.status, order.utr, ...(order.items || []).map((item) => item.name), when?.toISOString(), when?.toLocaleDateString('en-IN')].filter(Boolean).join(' ').toLowerCase()
    return matchesStatus && (!submittedQuery || searchText.includes(submittedQuery.toLowerCase()))
  })
  const confirmed = filtered.filter((order) => order.status === 'confirmed').length
  const completed = filtered.filter((order) => order.status === 'completed').length
  const orderValue = filtered.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total || 0), 0)
  return <section><div className="mb-6"><h2 className="text-2xl">Order analysis</h2><p className="mt-1 text-sm text-mute">Search by order number, customer, contact, product, or order date. Showing the latest {orders.length} active orders.</p></div><form className="grid gap-3 rounded-2xl border border-gold/20 bg-coal p-4 sm:grid-cols-[minmax(0,1fr)_190px_auto_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); setSubmittedQuery(query.trim()) }}><div><label className="label !mt-0">Search orders</label><input className="field" aria-label="Search orders" placeholder="Order no., name, phone, email, product…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div><label className="label !mt-0">Order status</label><select className="field" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">All active statuses</option>{['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></div><button className="btn" type="submit">Search</button><button className="ghost" type="button" onClick={() => { setQuery(''); setSubmittedQuery(''); setFilterStatus('all') }}>Reset</button></form><div className="my-5 grid gap-3 sm:grid-cols-4">{[['Matching orders', filtered.length], ['Confirmed', confirmed], ['Completed', completed], ['Order value', money(orderValue)]].map(([label, value]) => <div className="rounded-xl border border-gold/20 bg-coal px-4 py-3" key={label}><p className="text-xs text-mute">{label}</p><p className="mt-1 font-sans text-xl tabular-nums text-gold2">{value}</p></div>)}</div><OrderList orders={filtered} onStatus={onStatus} onInvoice={onInvoice} onArchive={onArchive} /></section>
}

function OrderList({ orders, onStatus, onInvoice, onArchive }) {
  if (!orders.length) return <p className="rounded-xl border border-dashed border-gold/30 p-8 text-center text-mute">No orders yet.</p>
  return <div className="space-y-3">{orders.map((o) => <article key={o._id || o.ref} className="rounded-2xl border border-gold/20 bg-coal p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-sans font-semibold tabular-nums text-gold2">{o.ref} · {money(o.total)}</p><p className="mt-1">{o.customer?.name} · <span className="font-sans tabular-nums">{o.customer?.phone}</span></p><p className="text-sm text-mute">{o.customer?.email} · {o.customer?.address}, <span className="font-sans tabular-nums">{o.customer?.pin}</span></p><p className="text-sm text-mute">{o.pay === 'cod' ? 'Cash on Delivery' : 'Online payment (UPI)'} {o.utr && `· UTR ${o.utr}`}</p><p className="mt-2 text-xs text-mute">Received: <time className="font-sans tabular-nums">{dateTime(o.createdAt)}</time></p></div><div className="flex flex-col items-end gap-2"><select aria-label={`Order ${o.ref} status`} className="field w-auto" value={o.status} onChange={(e) => onStatus(o._id, e.target.value)}>{['pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select><span className="text-xs text-mute">{o.statusHistory?.length ? 'Status history' : 'Last updated'}: <span className="font-sans tabular-nums">{o.statusHistory?.length ? dateTime(o.statusHistory[o.statusHistory.length - 1].at) : dateTime(o.updatedAt)}</span></span></div></div><p className="mt-3 text-sm text-mute">{o.items?.map((i) => <span key={i.id} className="mr-3 inline-block">{i.name} × <span className="font-sans tabular-nums">{i.qty}</span> · <span className="font-sans tabular-nums">{money(i.price * i.qty)}</span></span>)}</p>{o.statusHistory?.length > 0 && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">{o.statusHistory.map((event, index) => <span key={`${event.status}-${event.at}-${index}`}>{event.status[0].toUpperCase() + event.status.slice(1)} · <time className="font-sans tabular-nums">{dateTime(event.at)}</time></span>)}</div>}<div className="mt-4 flex flex-wrap gap-2"><button className="ghost" onClick={() => onInvoice(o)}>Download invoice PDF</button>{['completed', 'cancelled'].includes(o.status) && <button className="rounded-full border border-red-400/50 px-4 py-2 text-sm text-red-200 hover:bg-red-400/10" onClick={() => onArchive(o)}>Remove from active orders</button>}</div></article>)}</div>
}
