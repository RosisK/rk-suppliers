// lib/pocketbase.js
// This file sets up the connection to your PocketBase database.
// PocketBase is a simple backend that runs as a single file on your computer.

import PocketBase from 'pocketbase'

// The URL where your PocketBase server is running
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'

// Create a new PocketBase instance
// We export a function so each part of the app gets a fresh connection


export function createPocketBase() {
  return new PocketBase(POCKETBASE_URL)
}
const pb = new PocketBase(POCKETBASE_URL)
export default pb

// ─── Helper functions ──────────────────────────────────────────────────────────

// Get all products (with optional category filter)
export async function getProducts(category = '') {
  const client = createPocketBase()
  const filter = category ? `category = "${category}"` : ''
  const records = await client.collection('products').getFullList({
    filter,
    sort: '-created',
  })
  return records
}

// Get featured products for the home page
export async function getFeaturedProducts() {
  const client = createPocketBase()
  const records = await client.collection('products').getFullList({
    filter: 'featured = true',
    sort: '-created',
    limit: 6,
  })
  return records
}

// Get a single product by its ID
export async function getProduct(id) {
  const client = createPocketBase()
  const record = await client.collection('products').getOne(id)
  return record
}

// Get the URL for a product image
// PocketBase stores files and gives them a special URL
export function getImageUrl(record, filename) {
  if (!filename) return null
  const client = createPocketBase()
  return client.files.getUrl(record, filename)
}

// Submit a contact/inquiry message
export async function submitContact(data) {
  const client = createPocketBase()
  const record = await client.collection('contacts').create(data)
  return record
}
