'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  deleteAdminProduct,
  getAdminSession,
  getImageUrl,
  getProductImagePath,
  isCurrentUserAdmin,
  listAdminContacts,
  listAdminOrders,
  listAdminProducts,
  onAdminAuthStateChange,
  saveAdminProduct,
  signInAdmin,
  signOutAdmin,
  updateAdminOrderStatus,
} from '@/lib/supabase'

const CATEGORIES = ['Backpacks', 'Handbags', 'Tote Bags', 'Travel Bags', 'Wallets', 'Kids Bags', 'Other']
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  min_order: '',
  category: 'Backpacks',
  stock: '',
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
]

function statusStyle(status) {
  return ORDER_STATUSES.find((item) => item.value === status)?.color || 'bg-gray-100 text-gray-600'
}

function parseItems(items) {
  if (Array.isArray(items)) return items

  if (typeof items === 'string') {
    try {
      return JSON.parse(items)
    } catch (error) {
      return []
    }
  }

  return []
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formMessage, setFormMessage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [existingImagePath, setExistingImagePath] = useState(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const currentSession = await getAdminSession()
        if (isMounted) {
          setSession(currentSession)
          setAuthLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(error.message || 'Failed to read auth session.')
          setAuthLoading(false)
        }
      }
    }

    loadSession()

    const unsubscribe = onAdminAuthStateChange((nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setAuthLoading(false)
      setAuthError('')
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setProducts([])
      setMessages([])
      setOrders([])
      setHasAdminAccess(false)
      return
    }

    async function verifyAccessAndLoad() {
      try {
        const allowed = await isCurrentUserAdmin()
        setHasAdminAccess(allowed)

        if (!allowed) {
          setDashboardError('Your account is signed in, but it is not listed in admin_users.')
          return
        }

        refreshDashboard()
      } catch (error) {
        setDashboardError(error.message || 'Could not verify admin access.')
      }
    }

    verifyAccessAndLoad()
  }, [session])

  async function refreshDashboard() {
    setLoading(true)
    setDashboardError('')

    try {
      const [nextProducts, nextMessages, nextOrders] = await Promise.all([
        listAdminProducts(),
        listAdminContacts(),
        listAdminOrders(),
      ])

      setProducts(nextProducts)
      setMessages(nextMessages)
      setOrders(nextOrders)
    } catch (error) {
      setDashboardError(
        error.message ||
          'Could not load admin data. Confirm your Supabase tables, storage bucket, and RLS policies are set up.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setAuthError('')

    const { error } = await signInAdmin(loginForm)

    if (error) {
      setAuthError(error.message || 'Login failed.')
    }
  }

  async function handleLogout() {
    await signOutAdmin()
    setSelectedOrder(null)
  }

  function resetProductForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormMessage(null)
    setImageFile(null)
    setImagePreviewUrl('')
    setExistingImagePath(null)
    setRemoveExistingImage(false)
  }

  function openNewForm() {
    resetProductForm()
    setShowForm(true)
  }

  function openEditForm(product) {
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      min_order: product.min_order ?? '',
      category: product.category || 'Backpacks',
      stock: product.stock ?? '',
    })
    setEditingId(product.id)
    setFormMessage(null)
    setImageFile(null)
    setExistingImagePath(getProductImagePath(product))
    setImagePreviewUrl(getImageUrl(product) || '')
    setRemoveExistingImage(false)
    setShowForm(true)
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    setRemoveExistingImage(false)
    setImagePreviewUrl(
      file ? URL.createObjectURL(file) : getImageUrl({ image_path: existingImagePath }) || ''
    )
  }

  async function handleSaveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setFormMessage(null)

    try {
      await saveAdminProduct(form, {
        id: editingId,
        imageFile,
        existingImagePath,
        removeImage: removeExistingImage,
        userId: session.user.id,
      })
      setFormMessage({ type: 'success', text: editingId ? 'Product updated!' : 'Product added!' })
      await refreshDashboard()
      setTimeout(() => {
        setShowForm(false)
        resetProductForm()
      }, 1200)
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error.message || 'Failed to save product. Check your Supabase policies.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProduct(product) {
    if (!confirm('Delete this product?')) return

    try {
      await deleteAdminProduct(product.id, getProductImagePath(product))
      await refreshDashboard()
    } catch (error) {
      alert(error.message || 'Failed to delete product.')
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      const updatedOrder = await updateAdminOrderStatus(orderId, newStatus)
      setOrders((previous) =>
        previous.map((order) => (order.id === orderId ? updatedOrder : order))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder)
      }
    } catch (error) {
      alert(error.message || 'Failed to update status.')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-navy/60">Checking admin session...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-sm shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-navy rounded-sm flex items-center justify-center mx-auto mb-3">
              <span className="text-gold font-display font-bold">RK</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy">Admin Login</h1>
            <p className="text-xs text-navy/40 mt-2">
              Sign in with your Supabase Auth admin account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((previous) => ({ ...previous, email: event.target.value }))
              }
              placeholder="Email"
              className="w-full border border-cream-dark px-4 py-3 rounded-sm text-navy focus:outline-none focus:border-gold"
              required
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((previous) => ({ ...previous, password: event.target.value }))
              }
              placeholder="Password"
              className="w-full border border-cream-dark px-4 py-3 rounded-sm text-navy focus:outline-none focus:border-gold"
              required
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" className="w-full btn-primary py-3">
              Login
            </button>
          </form>

          <p className="text-xs text-navy/30 text-center mt-4">
            Create your admin user in Supabase Auth, then add that user ID to
            `admin_users`.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-cream-dark/50 text-sm">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshDashboard}
              className="text-cream-dark/60 hover:text-white text-sm"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-cream-dark/60 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-cream-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-cream-dark">
            {[
              { label: 'Products', value: products.length },
              { label: 'Orders', value: orders.length },
              { label: 'Messages', value: messages.length },
            ].map((item) => (
              <div key={item.label} className="py-4 px-4 text-center">
                <p className="font-display text-2xl font-bold text-navy">{item.value}</p>
                <p className="text-navy/50 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!hasAdminAccess ? (
          <div className="bg-white rounded-sm shadow-sm p-8 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-navy mb-3">Admin Access Required</h2>
            <p className="text-navy/70 leading-relaxed">
              This account is authenticated, but it is not in the `admin_users` table yet.
              Add the user ID in Supabase SQL, then refresh this page.
            </p>
          </div>
        ) : (
          <>
        <div className="flex gap-2 mb-8 border-b border-cream-dark">
          {[
            { key: 'products', label: 'Products' },
            { key: 'orders', label: 'Orders' },
            { key: 'messages', label: 'Messages' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === item.key
                  ? 'border-gold text-gold'
                  : 'border-transparent text-navy/50 hover:text-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {dashboardError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-sm mb-6">
            {dashboardError}
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-navy text-lg">Products ({products.length})</h2>
              <button onClick={openNewForm} className="btn-primary py-2 px-5 text-sm">
                + Add Product
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-sm shadow-sm p-6 mb-8 border border-gold/20">
                <h3 className="font-display text-xl font-bold text-navy mb-5">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                {formMessage && (
                  <div
                    className={`p-3 rounded-sm text-sm mb-4 ${
                      formMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {formMessage.text}
                  </div>
                )}
                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Name *</label>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, name: event.target.value }))
                      }
                      required
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, description: event.target.value }))
                      }
                      rows={3}
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Price (Rs.) *</label>
                    <input
                      value={form.price}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, price: event.target.value }))
                      }
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Min. Order (pcs)</label>
                    <input
                      value={form.min_order}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, min_order: event.target.value }))
                      }
                      type="number"
                      min="1"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, category: event.target.value }))
                      }
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy bg-white"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Stock</label>
                    <input
                      value={form.stock}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, stock: event.target.value }))
                      }
                      type="number"
                      min="0"
                      className="w-full border border-cream-dark px-3 py-2 rounded-sm focus:outline-none focus:border-gold text-navy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-1">Product Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-navy/60 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-navy file:text-gold hover:file:bg-navy-light"
                    />
                    {(imagePreviewUrl || existingImagePath) && !removeExistingImage && (
                      <div className="w-24 h-24 mt-3 rounded-sm overflow-hidden bg-cream">
                        <img
                          src={imagePreviewUrl || getImageUrl({ image_path: existingImagePath })}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {existingImagePath && (
                      <label className="flex items-center gap-2 mt-3 text-sm text-navy/60">
                        <input
                          type="checkbox"
                          checked={removeExistingImage}
                          onChange={(event) => setRemoveExistingImage(event.target.checked)}
                        />
                        Remove current image
                      </label>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        resetProductForm()
                      }}
                      className="px-6 py-2.5 text-sm border border-cream-dark rounded-sm text-navy hover:border-navy transition-colors"
                    >
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
                <p className="text-navy/60">No products yet. Click "Add Product" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const imageUrl = getImageUrl(product)

                  return (
                    <div key={product.id} className="bg-white rounded-sm shadow-sm p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-cream rounded-sm overflow-hidden flex-shrink-0 relative">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                            👜
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy truncate">{product.name}</p>
                        <p className="text-xs text-navy/50">
                          {product.category} · Rs. {Number(product.price).toLocaleString()}
                          {product.stock !== undefined && product.stock !== null
                            ? ` · Stock: ${product.stock}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditForm(product)}
                          className="text-xs border border-cream-dark px-3 py-1.5 rounded-sm hover:border-navy text-navy"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-sm hover:bg-red-50"
                        >
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

        {tab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-navy text-lg">Orders ({orders.length})</h2>
              <button onClick={refreshDashboard} className="text-sm text-navy/50 hover:text-gold transition-colors">
                Refresh
              </button>
            </div>

            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="font-display text-xl font-bold text-navy">Order Details</h3>
                        <p className="text-xs text-navy/40 font-mono mt-0.5">{selectedOrder.id}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-navy/40 hover:text-navy text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>

                    <div className="bg-cream rounded-sm p-4 mb-4 space-y-1.5 text-sm">
                      <p><span className="text-navy/50">Name:</span> <span className="font-medium text-navy">{selectedOrder.customer_name}</span></p>
                      <p><span className="text-navy/50">Phone:</span> <span className="font-medium text-navy">{selectedOrder.customer_phone}</span></p>
                      {selectedOrder.customer_email && (
                        <p><span className="text-navy/50">Email:</span> <span className="font-medium text-navy">{selectedOrder.customer_email}</span></p>
                      )}
                      <p><span className="text-navy/50">Address:</span> <span className="font-medium text-navy">{selectedOrder.address}</span></p>
                      <p><span className="text-navy/50">Payment:</span> <span className="font-medium text-navy capitalize">{selectedOrder.payment_method?.replace('_', ' ')}</span></p>
                      {selectedOrder.notes && (
                        <p><span className="text-navy/50">Notes:</span> <span className="font-medium text-navy">{selectedOrder.notes}</span></p>
                      )}
                    </div>

                    <h4 className="font-semibold text-navy mb-2 text-sm">Items Ordered</h4>
                    <div className="space-y-2 mb-4">
                      {parseItems(selectedOrder.items).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm bg-cream rounded-sm px-3 py-2">
                          <span className="text-navy">{item.name} × {item.qty} pcs</span>
                          <span className="font-semibold text-navy">
                            Rs. {(Number(item.price) * item.qty).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-cream-dark pt-3 mb-5">
                      <span className="font-bold text-navy">Total</span>
                      <span className="font-display text-xl font-bold text-gold">
                        Rs. {Number(selectedOrder.total).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Update Status</label>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, status.value)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold border-2 transition-colors ${
                              selectedOrder.status === status.value
                                ? `border-navy ${status.color}`
                                : `border-transparent ${status.color} opacity-60 hover:opacity-100`
                            }`}
                          >
                            {selectedOrder.status === status.value ? '✓ ' : ''}
                            {status.label}
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
                <p className="text-navy/60 font-medium">No orders yet</p>
                <p className="text-navy/40 text-sm mt-1">Orders will appear here when customers checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const itemCount = parseItems(order.items).reduce((sum, item) => sum + item.qty, 0)

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-sm shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusStyle(order.status)}`}>
                        {ORDER_STATUSES.find((status) => status.value === order.status)?.label || order.status}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy">{order.customer_name}</p>
                        <p className="text-xs text-navy/50">
                          {order.customer_phone} · {itemCount} pcs · {order.payment_method?.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gold">Rs. {Number(order.total).toLocaleString()}</p>
                        <p className="text-xs text-navy/40">
                          {order.created ? new Date(order.created).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div>
            <h2 className="font-semibold text-navy text-lg mb-6">Messages ({messages.length})</h2>
            {loading ? (
              <div className="text-center py-16 text-navy/40">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-sm">
                <p className="text-navy/60">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="bg-white rounded-sm shadow-sm p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-navy">{message.name}</p>
                        <div className="flex gap-3 text-xs text-navy/40 mt-0.5">
                          {message.email && <span>{message.email}</span>}
                          {message.phone && <span>{message.phone}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-navy/30">
                        {message.created ? new Date(message.created).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="text-navy/70 text-sm bg-cream p-3 rounded-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
