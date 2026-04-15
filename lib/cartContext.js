'use client'
// lib/cartContext.js
// This file creates a "global cart" that any page or component can access.
// React Context works like a shared storage box - you put data in once,
// and any component in your app can read from it without passing props around.

import { createContext, useContext, useState, useEffect } from 'react'

// Step 1: Create the context (the empty shared box)
const CartContext = createContext()

// Step 2: Create the Provider - this wraps your whole app and fills the box
export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loaded, setLoaded] = useState(false)

  // When the page first loads, read the saved cart from the browser's localStorage
  // localStorage is like a small notepad the browser keeps even after you close the tab
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rk_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch (e) {
      // If saved data is corrupted, just start with empty cart
      localStorage.removeItem('rk_cart')
    }
    setLoaded(true)
  }, [])

  // Whenever the cart changes, save the updated cart to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('rk_cart', JSON.stringify(cart))
    }
  }, [cart, loaded])

  // ── Cart Actions ──────────────────────────────────────────────

  // Add a product to the cart (or increase qty if already there)
  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        // Product already in cart - just increase the quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      // New product - add it to the array
      return [...prev, { ...product, qty }]
    })
  }

  // Remove a product from the cart entirely
  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Change the quantity of a specific item
  function updateQty(id, qty) {
    const newQty = parseInt(qty)
    if (isNaN(newQty) || newQty < 1) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    )
  }

  // Empty the entire cart (used after a successful order)
  function clearCart() {
    setCart([])
  }

  // ── Computed Values ───────────────────────────────────────────

  // Total number of individual items (e.g. 2 backpacks + 3 totes = 5)
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  // Total price across all items
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)

  // Step 3: Make everything available to child components
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Step 4: Custom hook - instead of writing useContext(CartContext) every time,
// you just write: const { cart, addToCart } = useCart()
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside a <CartProvider>')
  }
  return context
}
