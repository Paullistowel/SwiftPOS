import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  discount: 0,
  discountType: 'percentage', // 'percentage' | 'fixed'
  taxRate: 0,
  customer: null,
  note: '',
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case 'SET_DISCOUNT':
      return {
        ...state,
        discount: action.payload.amount,
        discountType: action.payload.type || state.discountType,
      };

    case 'SET_TAX_RATE':
      return { ...state, taxRate: action.payload };

    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };

    case 'SET_NOTE':
      return { ...state, note: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

function calculateTotals(state) {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount =
    state.discountType === 'percentage'
      ? subtotal * (state.discount / 100)
      : state.discount;

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (state.taxRate / 100);
  const total = afterDiscount + taxAmount;
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discountAmount, taxAmount, total, itemCount };
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const totals = calculateTotals(state);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const setDiscount = (amount, type) =>
    dispatch({ type: 'SET_DISCOUNT', payload: { amount, type } });
  const setTaxRate = (rate) => dispatch({ type: 'SET_TAX_RATE', payload: rate });
  const setCustomer = (customer) =>
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  const setNote = (note) => dispatch({ type: 'SET_NOTE', payload: note });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{
        ...state,
        ...totals,
        addItem,
        removeItem,
        updateQuantity,
        setDiscount,
        setTaxRate,
        setCustomer,
        setNote,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
