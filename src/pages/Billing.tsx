import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Tag,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Category, CartItem, Sale } from '../types/index.ts';
import { api } from '../api.ts';

interface BillingProps {
  onSaleCompleted: (sale: Sale) => void;
}

export const Billing: React.FC<BillingProps> = ({ onSaleCompleted }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Student');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === null || p.category_id === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Add to Cart
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      setErrorMsg(`"${product.name}" is currently out of stock.`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          setErrorMsg(`Cannot add more than ${product.stock_quantity} available units.`);
          setTimeout(() => setErrorMsg(''), 3000);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: Math.round((item.quantity + 1) * product.selling_price * 100) / 100,
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            subtotal: product.selling_price,
          },
        ];
      }
    });
  };

  // Update Cart Quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock_quantity) {
              setErrorMsg(`Only ${item.product.stock_quantity} units available in inventory.`);
              setTimeout(() => setErrorMsg(''), 3000);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: Math.round(newQty * item.product.selling_price * 100) / 100,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove single item
  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountPaid('');
  };

  // Barcode / Fast SKU scanner enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === query.toLowerCase() ||
        p.sku.toLowerCase() === query.toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      setErrorMsg(`No product found with Barcode/SKU: "${query}"`);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Financial calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const appliedDiscount = Math.max(0, Math.min(Number(discount) || 0, subtotal));
  const taxableAmount = Math.max(0, subtotal - appliedDiscount);
  const taxRate = 0.05; // 5% Academic sales tax
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const totalAmount = Math.round((taxableAmount + tax) * 100) / 100;

  // Amount tendered / change
  const numericTendered = parseFloat(amountPaid) || 0;
  const changeReturned =
    paymentMethod === 'cash' && numericTendered > totalAmount
      ? Math.round((numericTendered - totalAmount) * 100) / 100
      : 0;

  const isTenderValid =
    paymentMethod !== 'cash' || (numericTendered >= totalAmount && totalAmount > 0);

  // Set quick cash denominations
  const setQuickAmount = (val: number) => {
    setAmountPaid(String(val));
  };

  const handleExactCash = () => {
    setAmountPaid(String(totalAmount.toFixed(2)));
  };

  // Submit sale transaction
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Add items before checking out.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    if (paymentMethod === 'cash' && numericTendered < totalAmount) {
      setErrorMsg(`Tendered amount ($${numericTendered.toFixed(2)}) is less than total due ($${totalAmount.toFixed(2)}).`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    try {
      setCheckoutLoading(true);
      setErrorMsg('');

      const salePayload = {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        customer_name: customerName,
        customer_phone: customerPhone,
        discount: appliedDiscount,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'cash' ? numericTendered : totalAmount,
      };

      const res = await api.createSale(salePayload);

      // Celebrate success
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // Ignore if confetti not supported
      }

      // Reset cart
      clearCart();
      // Re-fetch products to reflect immediate stock deduction
      fetchData();

      // Trigger Invoice Modal
      onSaleCompleted(res.sale);
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
      {/* LEFT SECTION (Col 7): Catalog & Scanner */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Barcode & Search Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Direct Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
              <Barcode className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode or SKU & hit Enter..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </form>

            {/* Keyword Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item name, brand..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback / Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const isOut = p.stock_quantity <= 0;
              const isLow = p.stock_quantity <= p.min_stock_level && !isOut;
              const inCart = cart.find((item) => item.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => !isOut && addToCart(p)}
                  className={`group relative bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all select-none ${
                    isOut
                      ? 'border-slate-800/50 opacity-50 cursor-not-allowed'
                      : inCart
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/40 cursor-pointer'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer'
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden mb-2.5">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 right-1.5">
                      {isOut ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-900/90 text-rose-200 border border-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-900/90 text-amber-200 border border-amber-700">
                          {p.stock_quantity} Left
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-emerald-400 border border-emerald-900/40">
                          {p.stock_quantity} In Stock
                        </span>
                      )}
                    </div>

                    {inCart && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold shadow">
                        {inCart.quantity} in cart
                      </div>
                    )}
                  </div>

                  {/* Title & SKU */}
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      {p.sku}
                    </div>
                    <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug mt-0.5 group-hover:text-emerald-300 transition-colors">
                      {p.name}
                    </h4>
                  </div>

                  {/* Price & Add */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      ${p.selling_price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      disabled={isOut}
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No items match your filter</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try searching another SKU or category.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION (Col 5): Order Cart & POS Checkout Drawer */}
      <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Active Order</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Customer Information Form */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer / Student Name"
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (Optional)"
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[160px] max-h-[300px]">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {item.product.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ${item.product.selling_price.toFixed(2)} each · SKU: {item.product.sku}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono text-xs font-bold text-white px-2">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Line subtotal */}
              <div className="text-right min-w-[60px]">
                <div className="font-mono text-xs font-extrabold text-emerald-400">
                  ${item.subtotal.toFixed(2)}
                </div>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFromCart(item.product.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">Cart is currently empty</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Scan barcode or click items from catalog to begin sale
              </p>
            </div>
          )}
        </div>

        {/* Pricing Summary & Checkout */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Subtotal, Discount, Tax */}
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-400" />
                Discount ($)
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-20 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-right font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-between">
              <span>Academic Sales Tax (5%)</span>
              <span className="font-mono text-slate-200">${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
              <span>TOTAL DUE</span>
              <span className="font-mono text-emerald-400 text-base">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                UPI / QR
              </button>
            </div>
          </div>

          {/* Cash Drawer Calculator (If Cash selected) */}
          {paymentMethod === 'cash' && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Amount Tendered</span>
                <button
                  type="button"
                  onClick={handleExactCash}
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Exact (${totalAmount.toFixed(2)})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs font-mono text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={totalAmount.toFixed(2)}
                    className="w-full pl-6 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-1">
                  {[20, 50, 100].map((denom) => (
                    <button
                      key={denom}
                      type="button"
                      onClick={() => setQuickAmount(denom)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold border border-slate-700"
                    >
                      ${denom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change calculation */}
              {numericTendered > 0 && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Change Due:</span>
                  <span
                    className={`font-mono font-bold ${
                      numericTendered >= totalAmount ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${changeReturned.toFixed(2)}
                    {numericTendered < totalAmount && ' (Short)'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading || !isTenderValid}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
              cart.length === 0 || !isTenderValid
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950 active:scale-[0.99]'
            }`}
          >
            {checkoutLoading ? (
              <span>Recording Transaction...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Process Sale &amp; Print Receipt (${totalAmount.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
