import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  cartItems: any[]; // Keep for backward compatibility
  cart: Record<string, any>[]; // New cart structure to match website
}

const initialState: CartState = {
  cartItems: [],
  cart: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Record<string, any>>) => {
      state.cart.push(action.payload);
      state.cartItems.push(action.payload); // Keep both for compatibility
    },
    setCart: (state, action: PayloadAction<Record<string, any>[]>) => {
      state.cart = action.payload;
      state.cartItems = action.payload; // Keep both for compatibility
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    clearCart: (state) => {
      state.cart = [];
      state.cartItems = [];
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<any> }>
    ) => {
      const { id, updates } = action.payload;

      // Update in cart array
      const cartIndex = state.cart.findIndex((item) => item.id === id);
      if (cartIndex !== -1) {
        state.cart[cartIndex] = { ...state.cart[cartIndex], ...updates };
      }

      // Update in cartItems array for compatibility
      const cartItemsIndex = state.cartItems.findIndex(
        (item) => item.id === id
      );
      if (cartItemsIndex !== -1) {
        state.cartItems[cartItemsIndex] = {
          ...state.cartItems[cartItemsIndex],
          ...updates,
        };
      }
    },
  },
});

export const { addToCart, setCart, removeFromCart, clearCart, updateCartItem } =
  cartSlice.actions;

export default cartSlice.reducer;
