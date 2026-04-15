'use client'
// app/admin/page.js - Admin Dashboard
// Manage products, view contact messages, and manage orders.

import { useState, useEffect, useRef } from 'react'
import pb, { getImageUrl } from '@/lib/pocketbase'
import Image from 'next/image'

const CATEGORIES = ['Backpacks', 'Handbags', 'Tote Bags', 'Travel Bags', 'Wallets', 'Kids Bags', 'Other']
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
const EMPTY_FORM = { name: '', description: '', price: '', min_order: '', category: 'Backpacks', stock: '' }

// Order status options with colors
const ORDER_STATUSES = [
  { value: 'pending',   label: 'Pending',   color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped',   label: 'Shipped',   color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
]

function statusStyle(status) {
  return ORDER_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-600'
}

export default function AdminPage() {
  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')

  // Data
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  // Product form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formMessage, setFormMessage] = useState(null)
  const fileInputRef = useRef(null)

  // Order detail view
  const [selectedOrder, setSelectedOrder] = useState(null)

  function handleLogin(e) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      setLoginError('Incorrect password.')
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return
    if (tab === 'products') loadProducts()
    if (tab === 'messages') loadMessages()
    if (tab === 'orders') loadOrders()
  }, [isLoggedIn, tab])

  async function loadProducts() {
    setLoading(true)
    try {
      // const pb = createPocketBase()
      setProducts(await pb.collection('products').getFullList({ sort: '-created' }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadMessages() {
    setLoading(true)
    try {
      // const pb = createPocketBase()
      setMessages(await pb.collection('contacts').getFullList({ sort: '-created' }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadOrders() {
    setLoading(true)
    try {
      // const pb = createPocketBase()
      setOrders(await pb.collection('orders').getFullList({ sort: '-created' }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // ── Update order status ──────────────────────────────────────
  async function updateOrderStatus(orderId, newStatus) {
    try {
      // const pb = createPocketBase()
      await pb.collection('orders').update(orderId, { status: newStatus })
      // Update local state so the UI refreshes without a full reload
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (e) {
      alert('Failed to update status.')
    }
  }

  // ── Product Form ─────────────────────────────────────────────
  function openNewForm() {
    setForm(EMPTY_FORM); setEditingId(null); setImageFile(null)
    setFormMessage(null); setShowForm(true)
  }

  function openEditForm(p) {
    setForm({ name: p.name||'', description: p.description||'', price: p.price||'',
      min_order: p.min_order||'', category: p.category||'Backpacks', stock: p.stock||'' })
    setEditingId(p.id); setImageFile(null); setFormMessage(null); setShowForm(true)
  }

  async function handleSaveProduct(e) {
    e.preventDefault(); setSaving(true); setFormMessage(null)
    try {
      // const pb = createPocketBase()
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (imageFile) data.append('image', imageFile)
      if (editingId) {
        await pb.collection('products').update(editingId, data)
        setFormMessage({ type: 'success', text: 'Product updated!' })
      } else {
        await pb.collection('products').create(data)
        setFormMessage({ type: 'success', text: 'Product added!' })
      }
      loadProducts()
      setTimeout(() => { setShowForm(false); setFormMessage(null) }, 1200)
    } catch (e) {
      setFormMessage({ type: 'error', text: 'Failed to save. Is PocketBase running?' })
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await createPocketBase().collection('products').delete(id)
      loadProducts()
    } catch { alert('Failed to delete.') }
  }

  // ── Login Screen ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-sm shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-navy rounded-sm flex items-center justify-center mx-auto mb-3">
              <span className="text-gold font-display font-bold">RK</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input type="password" value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full border border-cream-dark px-4 py-3 rounded-sm text-navy mb-3 focus:outline-none focus:border-gold"
            />
            {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
            <button type="submit" className="w-full btn-primary py-3">Login</button>
          </form>
          <p className="text-xs text-navy/30 text-center mt-4">Enter the password to login</p>
        </div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-cream-dark/50 text-sm">RK Suppliers Management</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-cream-dark/50 hover:text-white text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-cream-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-cream-dark">
            {[
              { label: 'Products', value: products.length, icon: '📦' },
              { label: 'Orders', value: orders.length, icon: '🛒' },
              { label: 'Messages', value: messages.length, icon: '✉️' },
            ].map((s) => (
              <div key={s.label} className="py-4 px-4 text-center">
                <p className="font-display text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-navy/50 text-xs mt-0.5">{s.icon} {s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-cream-dark">
          {[
            { key: 'products', label: '📦 Products' },
            { key: 'orders',   label: '🛒 Orders' },
            { key: 'messages', label: '✉️ Messages' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-gold text-gold' : 'border-transparent text-navy/50 hover:text-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ─────────────────────────────────── */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-navy text-lg">Products ({products.length})</h2>
              <button onClick={openNewForm} className="btn-primary py-2 px-5 text-sm">+ Add Product</button>
            </div>

            {showForm && (
              <div className="bg-white rounded-sm shadow-sm p-6 mb-8 border border-gold/20">
                <h3 className="font-display text-xl font-bold text-navy mb-5">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                {formMessage && (
                  <div className={`p-3 rounded-sm text-sm mb-4 ${
                    formMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {formMessage.text}
                  </div>
                )}
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Name *</label>
                    <input name="name" value={form.name} onChange={(e) => setForm(p=>({...p,name:e.target.value}))}
                      required className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Description</label>
                    <textarea name="description" value={form.description}
                      onChange={(e) => setForm(p=>({...p,description:e.target.value}))} rows={3}
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Price (Rs.) *</label>
                    <input name="price" value={form.price} onChange={(e) => setForm(p=>({...p,price:e.target.value}))}
                      required type="number"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Min. Order (pcs)</label>
                    <input name="min_order" value={form.min_order} onChange={(e) => setForm(p=>({...p,min_order:e.target.value}))}
                      type="number"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Category</label>
                    <select name="category" value={form.category} onChange={(e) => setForm(p=>({...p,category:e.target.value}))}
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy bg-white">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Stock</label>
                    <input name="stock" value={form.stock} onChange={(e) => setForm(p=>({...p,stock:e.target.value}))}
                      type="number"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Product Image</label>
                    <input type="file" accept="image/*" ref={fileInputRef}
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full text-sm text-navy/60 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-navy file:text-gold hover:file:bg-navy-light" />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
                      {saving ? 'Saving...' : editingId ? 'Update' : 'Add Product'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-6 py-2.5 text-sm border border-cream-dark rounded-sm text-navy hover:border-navy transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-navy/40">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-sm">
                <span className="text-5xl block mb-3">📦</span>
                <p className="text-navy/60">No products yet. Click "Add Product" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const imgUrl = product.image ? getImageUrl(product, product.image) : null
                  return (
                    <div key={product.id} className="bg-white rounded-sm shadow-sm p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-cream rounded-sm overflow-hidden flex-shrink-0">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">👜</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy truncate">{product.name}</p>
                        <p className="text-xs text-navy/50">
                          {product.category} · Rs. {Number(product.price).toLocaleString()}
                          {product.stock !== undefined && ` · Stock: ${product.stock}`}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEditForm(product)}
                          className="text-xs border border-cream-dark px-3 py-1.5 rounded-sm hover:border-navy text-navy">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-sm hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ───────────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-navy text-lg">Orders ({orders.length})</h2>
              <button onClick={loadOrders} className="text-sm text-navy/50 hover:text-gold transition-colors">
                ↻ Refresh
              </button>
            </div>

            {/* Order detail modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="font-display text-xl font-bold text-navy">Order Details</h3>
                        <p className="text-xs text-navy/40 font-mono mt-0.5">{selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="text-navy/40 hover:text-navy text-xl leading-none">✕</button>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-cream rounded-sm p-4 mb-4 space-y-1.5 text-sm">
                      <p><span className="text-navy/50">Name:</span> <span className="font-medium text-navy">{selectedOrder.customer_name}</span></p>
                      <p><span className="text-navy/50">Phone:</span> <span className="font-medium text-navy">{selectedOrder.customer_phone}</span></p>
                      {selectedOrder.customer_email && (
                        <p><span className="text-navy/50">Email:</span> <span className="font-medium text-navy">{selectedOrder.customer_email}</span></p>
                      )}
                      <p><span className="text-navy/50">Address:</span> <span className="font-medium text-navy">{selectedOrder.address}</span></p>
                      <p><span className="text-navy/50">Payment:</span> <span className="font-medium text-navy capitalize">{selectedOrder.payment_method?.replace('_',' ')}</span></p>
                      {selectedOrder.notes && (
                        <p><span className="text-navy/50">Notes:</span> <span className="font-medium text-navy">{selectedOrder.notes}</span></p>
                      )}
                    </div>

                    {/* Order Items */}
                    <h4 className="font-semibold text-navy mb-2 text-sm">Items Ordered</h4>
                    <div className="space-y-2 mb-4">
                      {(() => {
                        try {
                          const items = typeof selectedOrder.items === 'string'
                            ? JSON.parse(selectedOrder.items) : selectedOrder.items
                          return items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm bg-cream rounded-sm px-3 py-2">
                              <span className="text-navy">{item.name} × {item.qty} pcs</span>
                              <span className="font-semibold text-navy">Rs. {(Number(item.price) * item.qty).toLocaleString()}</span>
                            </div>
                          ))
                        } catch { return <p className="text-navy/40 text-sm">Could not parse items</p> }
                      })()}
                    </div>

                    <div className="flex justify-between items-center border-t border-cream-dark pt-3 mb-5">
                      <span className="font-bold text-navy">Total</span>
                      <span className="font-display text-xl font-bold text-gold">Rs. {Number(selectedOrder.total).toLocaleString()}</span>
                    </div>

                    {/* Status Updater */}
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Update Status</label>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((s) => (
                          <button key={s.value}
                            onClick={() => updateOrderStatus(selectedOrder.id, s.value)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold border-2 transition-colors ${
                              selectedOrder.status === s.value
                                ? 'border-navy ' + s.color
                                : 'border-transparent ' + s.color + ' opacity-60 hover:opacity-100'
                            }`}
                          >
                            {selectedOrder.status === s.value ? '✓ ' : ''}{s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-navy/40">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-sm">
                <span className="text-5xl block mb-3">🛒</span>
                <p className="text-navy/60 font-medium">No orders yet</p>
                <p className="text-navy/40 text-sm mt-1">Orders will appear here when customers checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  // Parse the items JSON to count total pieces
                  let itemCount = 0
                  try {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                    itemCount = items.reduce((sum, i) => sum + i.qty, 0)
                  } catch {}

                  return (
                    <div key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-sm shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {/* Status dot */}
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusStyle(order.status)}`}>
                        {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy">{order.customer_name}</p>
                        <p className="text-xs text-navy/50">
                          {order.customer_phone} · {itemCount} pcs · {order.payment_method?.replace('_',' ')}
                        </p>
                      </div>

                      {/* Total + date */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gold">Rs. {Number(order.total).toLocaleString()}</p>
                        <p className="text-xs text-navy/40">
                          {new Date(order.created).toLocaleDateString('en-NP', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>

                      <span className="text-navy/30 text-sm">›</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ─────────────────────────────────── */}
        {tab === 'messages' && (
          <div>
            <h2 className="font-semibold text-navy text-lg mb-6">Messages ({messages.length})</h2>
            {loading ? (
              <div className="text-center py-16 text-navy/40">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-sm">
                <span className="text-5xl block mb-3">✉️</span>
                <p className="text-navy/60">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-sm shadow-sm p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-navy">{msg.name}</p>
                        <div className="flex gap-3 text-xs text-navy/40 mt-0.5">
                          {msg.email && <span>📧 {msg.email}</span>}
                          {msg.phone && <span>📞 {msg.phone}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-navy/30">
                        {new Date(msg.created).toLocaleDateString('en-NP', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    </div>
                    <p className="text-navy/70 text-sm bg-cream p-3 rounded-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
