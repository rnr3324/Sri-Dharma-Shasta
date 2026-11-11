import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { asset } from '../utils/helpers'
import { downloadInvoice } from '../utils/invoice'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api'
const blank = { name: '', price: '', cat: 'Pooja items', icon: '🪔', desc: '', img: '', includes: [] }
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

export default function Admin() {
  const { setProducts, site, setSite } = useApp()
  const [token, setToken] = useState(() => sessionStorage.getItem('sds-admin-token') || '')
  const [login, setLogin] = useState({ email: '', password: '' })
  const [data, setData] = useState(null)
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('overview')

  const request = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.message || 'Request failed')
    return body
  }
  const refresh = async () => {
    const [overview, catalog, settings] = await Promise.all([request('/admin/overview'), fetch(`${API}/products`).then((r) => r.json()), fetch(`${API}/site`).then((r) => r.json())])
    setData(overview)
    setProducts(catalog)
    setSite(settings)
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
      setForm(blank); setEditing(null); await refresh()
    } catch (e2) { setError(e2.message) } finally { setBusy(false) }
  }
  const edit = (p) => { setEditing(p.id); setForm({ name: p.name, price: p.price, cat: p.cat, icon: p.icon, desc: p.desc || '', img: p.img || '', includes: p.includes || [] }); setTab('products') }
  const remove = async (id) => { if (!window.confirm('Remove this product from the storefront?')) return; try { await request(`/admin/products/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { setError(e.message) } }
  const status = async (id, value) => { try { await request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: value }) }); await refresh() } catch (e) { setError(e.message) } }
  const archiveOrder = async (order) => {
    if (!window.confirm(`Remove order ${order.ref} from the active order list? It will be archived and can be recovered from the database.`)) return
    try { await request(`/admin/orders/${order._id}`, { method: 'DELETE' }); await refresh() } catch (e) { setError(e.message) }
  }
  const signOut = () => { sessionStorage.removeItem('sds-admin-token'); setToken(''); setData(null) }

  if (!token) return <main className="grid min-h-screen place-items-center bg-[#100b09] px-5"><form onSubmit={signIn} className="w-full max-w-md rounded-3xl border border-gold/30 bg-coal p-8 shadow-2xl"><a href="#/home" className="text-sm text-gold2">← Storefront</a><p className="mt-8 text-xs tracking-[.25em] text-gold">SRI DHARMA SHASTA</p><h1 className="mt-2 text-3xl">Admin sign in</h1><p className="mt-2 text-mute">Manage products, Tantri photos, and customer orders.</p><label className="label">Email</label><input className="field" type="email" autoComplete="username" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /><label className="label">Password</label><input className="field" type="password" autoComplete="current-password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />{error && <p className="mt-3 text-red-300">{error}</p>}<button disabled={busy} className="btn mt-6 w-full">{busy ? 'Signing in…' : 'Sign in securely'}</button></form></main>

  return <main className="min-h-screen bg-[#100b09] text-cream"><header className="border-b border-gold/20 bg-ink px-5 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-xs tracking-[.2em] text-gold">SRI DHARMA SHASTA</p><h1 className="text-2xl">Admin dashboard</h1></div><div className="flex gap-2"><a href="#/home" className="ghost">View store</a><button onClick={signOut} className="ghost">Sign out</button></div></div></header><div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">{error && <div className="mb-4 rounded-lg border border-red-400/40 bg-red-900/20 p-3 text-red-200">{error}</div>}<nav className="mb-7 flex gap-2 overflow-auto">{[['overview', 'Overview'], ['products', 'Products'], ['tantri', 'Tantri photos'], ['orders', 'Orders']].map(([v, label]) => <button key={v} onClick={() => setTab(v)} className={`rounded-full px-5 py-2 ${tab === v ? 'bg-gold text-ink' : 'border border-gold/30 text-gold2'}`}>{label}</button>)}</nav>
    {tab === 'overview' && data && <><div className="grid gap-4 sm:grid-cols-3">{[['Active products', data.products], ['Orders received', data.orders], ['Order value', money(data.sales)]].map(([label, value]) => <div className="rounded-2xl border border-gold/20 bg-coal p-5" key={label}><p className="text-sm text-mute">{label}</p><p className="mt-2 font-sans text-3xl tabular-nums text-gold2">{value}</p></div>)}</div><h2 className="mb-4 mt-9 text-xl">Latest orders</h2><OrderList orders={data.recent?.slice(0, 5) || []} onStatus={status} onInvoice={downloadInvoice} onArchive={archiveOrder} /></>}
    {tab === 'products' && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="space-y-3">{data?.allProducts?.map((p) => <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-coal p-4"><div className="flex min-w-0 items-center gap-3">{p.img ? <img src={p.img} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-lg bg-ink text-3xl">{p.icon}</span>}<div><b>{p.name}</b><p className="text-sm text-mute">{p.cat} · <span className="font-sans tabular-nums">{money(p.price)}</span></p></div></div><div className="flex gap-2"><button className="ghost !px-3 !py-1" onClick={() => edit(p)}>Edit</button><button className="ghost !px-3 !py-1" onClick={() => remove(p.id)}>Remove</button></div></div>)}</section><form onSubmit={saveProduct} className="h-fit rounded-2xl border border-gold/20 bg-coal p-5"><h2 className="text-xl">{editing ? 'Edit product' : 'Add product'}</h2><label className="label">Product name</label><input required className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><label className="label">Price (₹)</label><input required min="0" step="1" type="number" className="field font-sans tabular-nums" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><label className="label">Category</label><input required className="field" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} /><label className="label">Icon fallback</label><input className="field" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /><label className="label">Description</label><textarea className="field" rows="3" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /><label className="label">What's included (one item per line)</label><textarea className="field" rows="3" value={form.includes.join('\n')} onChange={(e) => setForm({ ...form, includes: e.target.value.split('\n').filter((line) => line.trim()) })} /><label className="label">Product image from your device</label><input className="field file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-3 file:py-1 file:font-semibold file:text-ink" type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { try { setBusy(true); const [img] = await uploadImages('products', e.target.files); if (img) setForm((f) => ({ ...f, img })) } catch (e2) { setError(e2.message) } finally { setBusy(false); e.target.value = '' } }} />{form.img && <div className="mt-3 flex items-center gap-3"><img src={form.img} alt="Product preview" className="h-20 w-20 rounded-xl object-cover" /><button type="button" className="ghost" onClick={() => setForm({ ...form, img: '' })}>Remove photo</button></div>}<p className="mt-2 text-xs text-mute">JPG, PNG, or WebP · maximum 5 MB</p><div className="mt-5 flex gap-2"><button disabled={busy} className="btn flex-1">{busy ? 'Uploading…' : editing ? 'Save product' : 'Add product'}</button>{editing && <button type="button" className="ghost" onClick={() => { setEditing(null); setForm(blank) }}>Cancel</button>}</div></form></div>}
    {tab === 'tantri' && <TantriPhotos site={site} persistSite={persistSite} uploadImages={uploadImages} busy={busy} setBusy={setBusy} setError={setError} />}
    {tab === 'orders' && <OrderManagement orders={data?.recent || []} onStatus={status} onInvoice={downloadInvoice} onArchive={archiveOrder} />}
  </div></main>
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
