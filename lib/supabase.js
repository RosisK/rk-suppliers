import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const productImageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || 'product-images'

let browserClient
let sharedClient

function ensureSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.')
  }
}

function getSharedClient() {
  ensureSupabaseConfig()

  if (!sharedClient) {
    sharedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return sharedClient
}

export function createSupabaseServerClient() {
  return getSharedClient()
}

export function createSupabaseBrowserClient() {
  ensureSupabaseConfig()

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}

function normalizeRecord(record) {
  if (!record) return record

  return {
    ...record,
    image_path: record.image_path ?? record.image ?? null,
    created: record.created ?? record.created_at ?? null,
    updated: record.updated ?? record.updated_at ?? null,
  }
}

function isMissingColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()
  return message.includes('column') && message.includes('does not exist')
}

async function runWithOrderFallback(buildQuery, columns = ['created_at', 'created']) {
  let lastError = null

  for (const column of columns) {
    const result = await buildQuery(column)

    if (!result.error) {
      return result
    }

    lastError = result.error

    if (!isMissingColumnError(result.error)) {
      break
    }
  }

  return { data: null, error: lastError }
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
}

function extractImagePath(recordOrPath) {
  if (!recordOrPath) return null

  if (typeof recordOrPath === 'string') {
    return recordOrPath
  }

  return recordOrPath.image_path || recordOrPath.image || null
}

function buildStoragePublicUrl(path) {
  const client = getSharedClient()
  return client.storage.from(productImageBucket).getPublicUrl(path).data.publicUrl
}

export async function getProducts(category = '') {
  const client = createSupabaseServerClient()
  const { data, error } = await runWithOrderFallback((orderColumn) => {
    let query = client.from('products').select('*')

    if (category) {
      query = query.eq('category', category)
    }

    return query.order(orderColumn, { ascending: false })
  })

  if (error) throw error

  return (data || []).map(normalizeRecord)
}

export async function getProduct(id) {
  const client = createSupabaseServerClient()
  const { data, error } = await client.from('products').select('*').eq('id', id).single()

  if (error) throw error

  return normalizeRecord(data)
}

export async function submitContact(contact) {
  const client = createSupabaseBrowserClient()
  const { data, error } = await client.from('contacts').insert(contact).select().single()

  if (error) throw error

  return normalizeRecord(data)
}

export async function createOrder(order) {
  const client = createSupabaseBrowserClient()
  const { data, error } = await client.from('orders').insert(order).select().single()

  if (error) throw error

  return normalizeRecord(data)
}

export async function signInAdmin({ email, password }) {
  const client = createSupabaseBrowserClient()
  return client.auth.signInWithPassword({ email, password })
}

export async function signOutAdmin() {
  const client = createSupabaseBrowserClient()
  return client.auth.signOut()
}

export async function getAdminSession() {
  const client = createSupabaseBrowserClient()
  const {
    data: { session },
    error,
  } = await client.auth.getSession()

  if (error) throw error

  return session
}

export async function isCurrentUserAdmin() {
  const client = createSupabaseBrowserClient()
  const { data, error } = await client.from('admin_users').select('user_id').maybeSingle()

  if (error) throw error

  return Boolean(data?.user_id)
}

export function onAdminAuthStateChange(callback) {
  const client = createSupabaseBrowserClient()
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return () => subscription.unsubscribe()
}

async function listTable(table) {
  const client = createSupabaseBrowserClient()
  const { data, error } = await runWithOrderFallback((orderColumn) => {
    return client.from(table).select('*').order(orderColumn, { ascending: false })
  })

  if (error) throw error

  return (data || []).map(normalizeRecord)
}

async function uploadProductImage(file, userId) {
  const client = createSupabaseBrowserClient()
  const filename = sanitizeFilename(file.name || 'product-image')
  const path = `${userId}/${Date.now()}-${filename}`
  const { error } = await client.storage.from(productImageBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  return path
}

export async function removeProductImage(path) {
  if (!path) return

  const client = createSupabaseBrowserClient()
  const { error } = await client.storage.from(productImageBucket).remove([path])

  if (error) throw error
}

export function listAdminProducts() {
  return listTable('products')
}

export function listAdminContacts() {
  return listTable('contacts')
}

export function listAdminOrders() {
  return listTable('orders')
}

export async function saveAdminProduct(
  product,
  { id, imageFile, existingImagePath, removeImage = false, userId }
) {
  const client = createSupabaseBrowserClient()
  const oldImagePath = existingImagePath || null
  let imagePath = oldImagePath
  let uploadedImagePath = null

  if (removeImage) {
    imagePath = null
  }

  if (imageFile) {
    uploadedImagePath = await uploadProductImage(imageFile, userId)
    imagePath = uploadedImagePath
  }

  const payload = {
    name: product.name,
    description: product.description || null,
    price: Number(product.price || 0),
    min_order: product.min_order === '' ? null : Number(product.min_order),
    category: product.category || null,
    stock: product.stock === '' ? null : Number(product.stock),
    image_path: imagePath,
  }

  const query = id
    ? client.from('products').update(payload).eq('id', id)
    : client.from('products').insert(payload)

  const { data, error } = await query.select().single()

  if (error) {
    if (uploadedImagePath) {
      await removeProductImage(uploadedImagePath)
    }
    throw error
  }

  if ((removeImage || uploadedImagePath) && oldImagePath && oldImagePath !== imagePath) {
    await removeProductImage(oldImagePath)
  }

  return normalizeRecord(data)
}

export async function deleteAdminProduct(id, imagePath) {
  const client = createSupabaseBrowserClient()
  const { error } = await client.from('products').delete().eq('id', id)

  if (error) throw error

  if (imagePath) {
    await removeProductImage(imagePath)
  }
}

export async function updateAdminOrderStatus(orderId, status) {
  const client = createSupabaseBrowserClient()
  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error

  return normalizeRecord(data)
}

export function getImageUrl(record, fallbackValue) {
  const imageValue = extractImagePath(record) || extractImagePath(fallbackValue)

  if (!imageValue || typeof imageValue !== 'string') {
    return null
  }

  if (
    imageValue.startsWith('http://') ||
    imageValue.startsWith('https://') ||
    imageValue.startsWith('/')
  ) {
    return imageValue
  }

  return buildStoragePublicUrl(imageValue)
}

export function getProductImagePath(record) {
  return extractImagePath(record)
}

export function getProductImageBucket() {
  return productImageBucket
}
