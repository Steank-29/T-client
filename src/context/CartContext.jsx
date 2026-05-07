// contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const SHIPPING_COST = 9;
  const FREE_SHIPPING_THRESHOLD = 200;
  const TAX_RATE = 0;

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('tawakkul_cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('tawakkul_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('tawakkul_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Get the effective price for a product
  const getEffectivePrice = (product) => {
    if (product.discountedPrice) {
      return parseFloat(product.discountedPrice);
    }
    if (product.discount > 0) {
      return parseFloat((product.price * (1 - product.discount / 100)).toFixed(2));
    }
    return product.price || 0;
  };

  // Add item to cart
  const addToCart = (product, quantity = 1, selectedSize = null) => {
    if (!product?.id && !product?._id) {
      console.error('Invalid product - missing ID:', product);
      return;
    }

    const productId = product.id || product._id;
    const size = selectedSize || (product.size && product.size.length > 0 ? product.size[0] : 'One Size');
    const price = getEffectivePrice(product);
    const originalPrice = product.price || price;
    const mainImage = product.mainImage?.url || product.mainImage || product.images?.[0]?.url || 'https://via.placeholder.com/150';

    setCart((prev) => {
      // Find existing item with same product ID and size
      const existingIndex = prev.findIndex(
        (item) => (item.productId === productId || item._id === productId) && item.selectedSize === size
      );

      if (existingIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity,
        };
        return updatedCart;
      }

// Determine if this is an Offer (has mainPrice) or a Product (has price)
const isOffer = product.isOffer === true || product.mainPrice !== undefined;

// Add new item
const newItem = {
  _id: productId,
  productId: productId,
  name: product.name,
  price: price,
  originalPrice: originalPrice,
  mainImage: mainImage,
  quantity: quantity,
  selectedSize: size,
  discount: product.discount || 0,
  category: product.category || '',
  isOffer: isOffer, // ✅ THIS IS THE KEY FIX
  variantKey: `${productId}-${size}`,
};

      return [...prev, newItem];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId, size = null) => {
    setCart((prev) =>
      prev.filter(
        (item) => !((item.productId === productId || item._id === productId) && item.selectedSize === size)
      )
    );
  };

  // Update item quantity
  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        (item.productId === productId || item._id === productId) && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('tawakkul_cart');
  };

  // Toggle cart drawer
  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  // Open cart drawer
  const openCart = () => {
    setIsCartOpen(true);
  };

  // Close cart drawer
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Check if item is in cart
  const isInCart = useCallback(
    (productId, size = null) => {
      return cart.some(
        (item) =>
          (item.productId === productId || item._id === productId) &&
          (size ? item.selectedSize === size : true)
      );
    },
    [cart]
  );

  // Get item from cart
  const getItem = useCallback(
    (productId, size = null) => {
      return cart.find(
        (item) =>
          (item.productId === productId || item._id === productId) &&
          (size ? item.selectedSize === size : true)
      );
    },
    [cart]
  );

  // Get quantity of a specific item
  const getItemQuantity = useCallback(
    (productId, size = null) => {
      const item = cart.find(
        (item) =>
          (item.productId === productId || item._id === productId) &&
          (size ? item.selectedSize === size : true)
      );
      return item ? item.quantity : 0;
    },
    [cart]
  );

  // Calculated cart metrics
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalDiscount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const shippingCost = useMemo(
    () => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),
    [subtotal]
  );

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);

  const total = useMemo(() => subtotal + shippingCost + tax, [subtotal, shippingCost, tax]);

  const cartIsEmpty = useMemo(() => cart.length === 0, [cart]);

  const value = {
    // State
    cart,
    isCartOpen,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,

    // Calculated values
    cartCount,
    subtotal,
    totalDiscount,
    shippingCost,
    tax,
    total,
    cartIsEmpty,
    FREE_SHIPPING_THRESHOLD,

    // Utilities
    isInCart,
    getItem,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;