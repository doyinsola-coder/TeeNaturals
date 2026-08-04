import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaWhatsapp, FaPlus, FaMinus, FaLock, FaSpinner,
  FaExclamationTriangle, FaRedo, FaTimes,
} from "react-icons/fa";
import api from "../api/axios";

const VENDOR_PHONE = "2348055061699";

const T = {
  green:       "#1a3a2e",
  greenMid:    "#2d5a47",
  gold:        "#d4af37",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",
};

const CATEGORY_COLORS = {
  SKINCARE:    "#c8956c",
  HAIRCARE:    T.greenMid,
  BABYCARE:    "#e8c4b8",
  ACCESSORIES: T.gold,
};

const fmtNaira = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);

// ─────────────────────────────────────────────────────────────────────────────
// SHIPPING ADDRESS MODAL — same pattern used on /products and the dashboard
// ─────────────────────────────────────────────────────────────────────────────
const ShippingAddressModal = ({ open, onClose, initialAddress, onConfirm, submitting }) => {
  const [form, setForm] = useState(initialAddress);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setForm(initialAddress); setError(""); }
  }, [open, initialAddress]);

  if (!open) return null;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim()) {
      setError("Please fill in every field so we know where to deliver your order.");
      return;
    }
    setError("");
    onConfirm(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={submitting ? undefined : onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}
      >
        <div className="bg-[#1a3a2e] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: T.fontDisplay }} className="text-xl font-bold text-white">
              Delivery Details
            </h2>
            <p className="text-white/60 text-xs mt-0.5">Where should we send your order?</p>
          </div>
          {!submitting && (
            <button onClick={onClose} className="text-white/70 hover:text-white p-1" aria-label="Close">
              <FaTimes />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
          <input value={form.fullName} onChange={set("fullName")} placeholder="Full name"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:outline-none text-sm disabled:opacity-60" />
          <input value={form.phone} onChange={set("phone")} placeholder="Phone number" type="tel"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:outline-none text-sm disabled:opacity-60" />
          <input value={form.address} onChange={set("address")} placeholder="Street address"
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:outline-none text-sm disabled:opacity-60" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={set("city")} placeholder="City"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:outline-none text-sm disabled:opacity-60" />
            <input value={form.state} onChange={set("state")} placeholder="State"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:outline-none text-sm disabled:opacity-60" />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={!submitting ? { scale: 1.02 } : {}}
            whileTap={!submitting ? { scale: 0.97 } : {}}
            className="w-full mt-2 bg-[#1a3a2e] text-white py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <FaSpinner className="animate-spin" />}
            {submitting ? "Processing…" : "Continue to Payment"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [qty, setQty] = useState(1);

  const [shippingOpen, setShippingOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(() => {
    try {
      const stored = localStorage.getItem("tn_shipping_address");
      return stored ? JSON.parse(stored) : { fullName: "", phone: "", address: "", city: "", state: "" };
    } catch {
      return { fullName: "", phone: "", address: "", city: "", state: "" };
    }
  });
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  const loadProduct = () => {
    setLoading(true);
    setNotFound(false);
    setFetchError("");
    api.get("/products")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.products ?? []);
        const found = list.find(p => p._id === id);
        if (!found) {
          setNotFound(true);
        } else {
          setProduct(found);
          setQty(1);
        }
      })
      .catch(() => setFetchError("Couldn't load this product right now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProduct(); /* eslint-disable-next-line */ }, [id]);

  const handleConfirmShipping = (address) => {
    try {
      localStorage.setItem("tn_shipping_address", JSON.stringify(address));
    } catch {
      // non-fatal
    }
    setShippingAddress(address);
    setShippingOpen(false);
    handleBuyNow(address);
  };

  const handleBuyNow = async (address) => {
    const token = localStorage.getItem("tn_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setBuying(true);
    setBuyError("");
    try {
      const user = JSON.parse(localStorage.getItem("tn_user") || "{}");
      const totalPrice = product.price * qty;

      const { data: order } = await api.post("/orders", {
        orderItems: [{
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.image,
        }],
        totalPrice,
        shippingAddress: address,
      });

      const orderId = order._id;
      if (!orderId) throw new Error("Order creation failed.");

      const { data: paystack } = await api.post("/orders/pay", {
        email: user.email,
        amount: totalPrice,
        orderId,
      });

      const paymentUrl = paystack?.data?.authorization_url;
      if (!paymentUrl) throw new Error("Unable to initialize payment.");

      window.location.href = paymentUrl;
    } catch (err) {
      setBuyError(err?.response?.data?.message || err?.message || "Checkout failed.");
      setBuying(false);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const price = product.price * qty;
    const text = `Hi! I'd like to purchase *${product.name}* x${qty} for ₦${price.toLocaleString()}`;
    window.open(`https://wa.me/${VENDOR_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-4 w-32 bg-stone-200 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="h-96 bg-stone-200 rounded-3xl" />
            <div className="flex flex-col gap-4">
              <div className="h-8 w-3/4 bg-stone-200 rounded-full" />
              <div className="h-5 w-1/3 bg-stone-200 rounded-full" />
              <div className="h-24 bg-stone-100 rounded-2xl" />
              <div className="h-12 bg-stone-200 rounded-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (notFound || fetchError) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-400 text-2xl" />
          </div>
          <h1 style={{ fontFamily: T.fontDisplay }} className="text-2xl font-bold text-[#1a3a2e] mb-2">
            {notFound ? "Product not found" : "Something went wrong"}
          </h1>
          <p className="text-[#1a3a2e]/50 text-sm mb-6">
            {notFound
              ? "This product may have been removed or the link is incorrect."
              : fetchError}
          </p>
          <div className="flex gap-3 justify-center">
            {fetchError && (
              <button onClick={loadProduct}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a2e] text-white rounded-full text-sm font-semibold">
                <FaRedo className="text-xs" /> Try Again
              </button>
            )}
            <Link to="/products"
              className="px-5 py-2.5 border border-[#1a3a2e]/20 rounded-full text-sm font-semibold text-[#1a3a2e]">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const outOfStock = product.countInStock != null && product.countInStock <= 0;
  const atMax = product.countInStock != null && qty >= product.countInStock;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-20 px-4" style={{ fontFamily: T.fontBody }}>
      <div className="max-w-5xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-[#1a3a2e]/60 hover:text-[#1a3a2e] text-sm font-medium mb-6"
        >
          <FaArrowLeft className="text-xs" /> Back to Products
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-10 md:gap-14"
        >
          {/* Image */}
          <div className="relative bg-white rounded-3xl overflow-hidden flex items-center justify-center p-6"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)", minHeight: 380 }}>
            {product.image ? (
              <img src={product.image} alt={product.name}
                className="max-w-full max-h-[420px] w-auto h-auto object-contain" />
            ) : (
              <div className="text-6xl opacity-30">🌿</div>
            )}
            {product.category && (
              <span
                className="absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: CATEGORY_COLORS[product.category] || T.green }}
              >
                {product.category}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 style={{ fontFamily: T.fontDisplay }} className="text-3xl md:text-4xl font-bold text-[#1a3a2e] mb-3 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span style={{ fontFamily: T.fontDisplay }} className="text-3xl font-bold text-[#d4af37]">
                {fmtNaira(product.price * qty)}
              </span>
              {qty > 1 && (
                <span className="text-sm text-[#1a3a2e]/45">{fmtNaira(product.price)} each</span>
              )}
            </div>

            {product.description && (
              <p className="text-[#1a3a2e]/65 leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {product.countInStock != null && (
              <p className="text-xs font-mono uppercase tracking-widest text-[#1a3a2e]/35 mb-6">
                {outOfStock ? "Out of stock" : `${product.countInStock} in stock`}
              </p>
            )}

            {!outOfStock && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-[#1a3a2e]/60">Quantity</span>
                <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1.5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 bg-[#1a3a2e]/6 hover:bg-red-50 rounded-full flex items-center justify-center">
                    <FaMinus className="text-[10px] text-[#1a3a2e]" />
                  </button>
                  <span className="w-6 text-center font-bold text-[#1a3a2e]">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} disabled={atMax}
                    className="w-8 h-8 bg-[#1a3a2e]/6 hover:bg-green-50 rounded-full flex items-center justify-center disabled:opacity-30">
                    <FaPlus className="text-[10px] text-[#1a3a2e]" />
                  </button>
                </div>
              </div>
            )}

            {buyError && (
              <p className="text-red-500 text-sm mb-4">{buyError}</p>
            )}

            <div className="flex flex-col gap-3 mt-auto">
              <motion.button
                whileHover={!buying && !outOfStock ? { scale: 1.02 } : {}}
                whileTap={!buying && !outOfStock ? { scale: 0.97 } : {}}
                disabled={buying || outOfStock}
                onClick={() => setShippingOpen(true)}
                className="w-full bg-[#1a3a2e] text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ boxShadow: "0 8px 24px rgba(26,58,46,0.25)" }}
              >
                {buying ? <FaSpinner className="animate-spin" /> : <FaLock className="text-sm" />}
                {outOfStock ? "Out of Stock" : buying ? "Processing…" : "Buy Now"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#20b858" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] text-white py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
              >
                <FaWhatsapp /> Order via WhatsApp
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {shippingOpen && (
          <ShippingAddressModal
            open={shippingOpen}
            onClose={() => setShippingOpen(false)}
            initialAddress={shippingAddress}
            onConfirm={handleConfirmShipping}
            submitting={buying}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;