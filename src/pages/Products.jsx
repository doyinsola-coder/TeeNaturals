/**
 * TeeNaturalProducts.jsx
 * ─────────────────────────────────────────────────────────────────
 * Production-ready TeeNatural product page.
 *
 * ✅ Products fetched from GET /api/products
 * ✅ Cart fully fixed — self-contained useReducer, _id everywhere
 * ✅ +/- and remove buttons all work correctly
 * ✅ Paystack checkout: POST /api/orders → POST /api/orders/pay → redirect
 * ✅ WhatsApp kept as fallback
 * ✅ Skeleton loaders + error/retry state
 * ✅ Checkout error toast (non-blocking)
 * ✅ Product detail modal on card click (full description + full image view)
 * ✅ All animations, UI, filters, search, wishlist 100% preserved
 *
 * Dependencies: framer-motion, react-icons/fa, axios
 * Set VITE_API_URL in .env for your backend base URL.
 * ─────────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useRef,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import axios from "axios";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FaShoppingCart,
  FaWhatsapp,
  FaHeart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaTrash,
  FaSearch,
  FaExclamationTriangle,
  FaRedo,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "";
const VENDOR_PHONE = "2348055061699";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  green:       "#1a3a2e",
  greenMid:    "#2d5a47",
  gold:        "#d4af37",
  clay:        "0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85)",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// CART REDUCER  — _id is the single key, no external context needed
// ─────────────────────────────────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {

    case "ADD_ITEM": {
      const product = action.payload;
      const exists  = state.find(i => i._id === product._id);
      if (exists) {
        return state.map(i =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...product, quantity: 1 }];
    }

    case "INCREMENT":
      return state.map(i =>
        i._id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
      );

    case "DECREMENT":
      return state
        .map(i =>
          i._id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0);           // auto-remove when qty hits 0

    case "REMOVE":
      return state.filter(i => i._id !== action.payload);

    case "CLEAR":
      return [];

    default:
      return state;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY META
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  ALL:         { color: T.green,    icon: <IconAll /> },
  SKINCARE:    { color: "#c8956c",  icon: <IconSkincare /> },
  HAIRCARE:    { color: T.greenMid, icon: <IconHaircare /> },
  BABYCARE:    { color: "#e8c4b8",  icon: <IconBabycare /> },
  ACCESSORIES: { color: T.gold,     icon: <IconAccessories /> },
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
function IconAll() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
      <circle cx="8"  cy="8"  r="5" fill="currentColor" opacity="0.9" />
      <circle cx="20" cy="8"  r="5" fill="currentColor" opacity="0.6" />
      <circle cx="8"  cy="20" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="20" r="5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
function IconSkincare() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
      <rect x="5" y="12" width="18" height="12" rx="4" fill="currentColor" opacity="0.85" />
      <rect x="4" y="9"  width="20" height="5"  rx="2.5" fill="currentColor" />
      <ellipse cx="14" cy="14" rx="4" ry="2" fill="white" opacity="0.35" />
      <path d="M14 2 Q16 5 14 8 Q12 5 14 2Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
function IconHaircare() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
      <rect x="9" y="10" width="10" height="15" rx="4" fill="currentColor" opacity="0.85" />
      <rect x="11" y="6" width="6"  height="6"  rx="2" fill="currentColor" opacity="0.7" />
      <rect x="12" y="3" width="4"  height="4"  rx="1.5" fill="currentColor" />
      <ellipse cx="11" cy="16" rx="2" ry="5" fill="white" opacity="0.25" />
      <ellipse cx="23" cy="8" rx="4" ry="7" fill="currentColor" opacity="0.45" transform="rotate(30,23,8)" />
    </svg>
  );
}
function IconBabycare() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
      <path d="M14 3 L16 10 L23 10 L17.5 14.5 L19.5 21.5 L14 17 L8.5 21.5 L10.5 14.5 L5 10 L12 10Z"
        fill="currentColor" opacity="0.85" />
    </svg>
  );
}
function IconAccessories() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
      <line x1="14" y1="2"  x2="14" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <line x1="2"  y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <line x1="5"  y1="5"  x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <line x1="23" y1="5"  x2="5"  y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <circle cx="14" cy="14" r="3.5" fill="currentColor" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTANICAL HEADER DECORATION
// ─────────────────────────────────────────────────────────────────────────────
const HeaderBotanical = () => (
  <svg viewBox="0 0 800 120" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-2xl mx-auto opacity-20 pointer-events-none select-none"
    aria-hidden="true">
    <path d="M50 100 Q120 60 180 80 Q220 95 260 70" stroke="#1a3a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="130" cy="62" rx="22" ry="12" fill="#2d5a47" transform="rotate(-30,130,62)" />
    <ellipse cx="175" cy="74" rx="18" ry="10" fill="#4a9a6b" transform="rotate(-10,175,74)" />
    <ellipse cx="90"  cy="80" rx="16" ry="9"  fill="#2d5a47" transform="rotate(-50,90,80)" />
    <path d="M750 100 Q680 60 620 80 Q580 95 540 70" stroke="#1a3a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="670" cy="62" rx="22" ry="12" fill="#2d5a47" transform="rotate(30,670,62)" />
    <ellipse cx="625" cy="74" rx="18" ry="10" fill="#4a9a6b" transform="rotate(10,625,74)" />
    <ellipse cx="710" cy="80" rx="16" ry="9"  fill="#2d5a47" transform="rotate(50,710,80)" />
    {[340, 400, 460].map((x, i) => (
      <g key={i} transform={`translate(${x}, 55)`}>
        <circle cx="0" cy="0" r="7" fill="#d4af37" opacity="0.9" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a}
            cx={Math.cos(a * Math.PI / 180) * 12}
            cy={Math.sin(a * Math.PI / 180) * 12}
            rx="5" ry="7" fill="#f0d060" opacity="0.7"
            transform={`rotate(${a},${Math.cos(a * Math.PI / 180) * 12},${Math.sin(a * Math.PI / 180) * 12})`}
          />
        ))}
      </g>
    ))}
    {[{x:310,y:30},{x:490,y:28},{x:400,y:18}].map((s, i) => (
      <g key={i} transform={`translate(${s.x},${s.y})`}>
        <line x1="-8" y1="0" x2="8"  y2="0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="0"  y1="-8" x2="0" y2="8" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>
    ))}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY CART ILLUSTRATION
// ─────────────────────────────────────────────────────────────────────────────
const EmptyCartIllustration = () => (
  <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-36 mx-auto mb-4" aria-hidden="true">
    <rect x="30" y="70" width="140" height="95" rx="18" fill="#f5f0e8" />
    <rect x="30" y="70" width="140" height="95" rx="18" stroke="#1a3a2e" strokeWidth="2.5" strokeOpacity="0.15" />
    <path d="M70 70 Q70 38 100 38 Q130 38 130 70" stroke="#1a3a2e" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.25" />
    <circle cx="85"  cy="118" r="6" fill="#1a3a2e" opacity="0.2" />
    <circle cx="115" cy="118" r="6" fill="#1a3a2e" opacity="0.2" />
    <path d="M85 140 Q100 132 115 140" stroke="#1a3a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.2" />
    <ellipse cx="22"  cy="88"  rx="12" ry="20" fill="#4a9a6b" opacity="0.5"  transform="rotate(-35,22,88)" />
    <ellipse cx="178" cy="95"  rx="10" ry="18" fill="#6dbf82" opacity="0.45" transform="rotate(25,178,95)" />
    <g transform="translate(160,60)">
      <line x1="-6" y1="0" x2="6" y2="0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
    </g>
    <circle cx="42" cy="60" r="4" fill="#d4af37" opacity="0.5" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="bg-white rounded-3xl overflow-hidden flex flex-col"
    style={{ boxShadow: T.clay }}
  >
    <div className="h-52 sm:h-56 relative overflow-hidden bg-linear-to-br from-stone-100 to-stone-200">
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.3 }}
      />
    </div>
    <div className="p-5 flex flex-col flex-1 gap-3">
      <div className="h-4 bg-stone-200 rounded-full w-3/4" />
      <div className="h-3 bg-stone-100 rounded-full w-full" />
      <div className="h-3 bg-stone-100 rounded-full w-2/3" />
      <div className="h-6 bg-stone-200 rounded-full w-1/2 mt-1" />
      <div className="h-10 bg-stone-100 rounded-full mt-auto" />
      <div className="h-10 bg-green-50  rounded-full" />
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR STATE
// ─────────────────────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 px-6 text-center"
  >
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <FaExclamationTriangle className="text-red-400 text-2xl" />
    </div>
    <h3 style={{ fontFamily: T.fontDisplay }} className="text-xl text-[#1a3a2e] font-bold mb-2">
      Couldn't load products
    </h3>
    <p className="text-[#1a3a2e]/45 text-sm mb-6 max-w-xs">
      {message || "Something went wrong. Please try again."}
    </p>
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-3 bg-[#1a3a2e] text-white rounded-full font-semibold text-sm"
      style={{ boxShadow: "0 6px 20px rgba(26,58,46,0.3)" }}
    >
      <FaRedo className="text-xs" /> Try Again
    </motion.button>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT ERROR TOAST  (non-blocking, dismissible)
// ─────────────────────────────────────────────────────────────────────────────
const CheckoutErrorToast = ({ message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium max-w-sm w-[90vw]"
      >
        <FaExclamationTriangle className="shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity" aria-label="Dismiss">
          <FaTimes />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// LAZY IMAGE
// ─────────────────────────────────────────────────────────────────────────────
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-linear-to-br from-stone-100 to-stone-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL MODAL — shows full description + full (uncropped) image on card click
// ─────────────────────────────────────────────────────────────────────────────
const ProductModal = ({
  product,
  onClose,
  quantity,
  onAddToCart,
  onIncrement,
  onDecrement,
  onPurchaseNow,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Panel */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col sm:flex-row relative"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
            aria-label="Close product details"
          >
            <FaTimes className="text-[#1a3a2e] text-sm" />
          </button>

          {/* Image — full picture visible (object-contain), not cropped */}
          <div className="relative w-full sm:w-2/5 h-64 sm:h-auto shrink-0 bg-stone-100 flex items-center justify-center p-4 sm:p-5">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
            <div className="absolute top-3 left-3">
              <span
                className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: CATEGORY_META[product.category]?.color || T.green, opacity: 0.92 }}
              >
                {product.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col">
            <h2
              style={{ fontFamily: T.fontDisplay }}
              className="text-2xl sm:text-3xl font-bold text-[#1a3a2e] mb-2 leading-tight pr-8"
            >
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mb-5">
              <span style={{ fontFamily: T.fontDisplay }} className="text-2xl font-bold text-[#d4af37]">
                ₦{(quantity > 0 ? product.price * quantity : product.price).toLocaleString()}
              </span>
              {quantity > 1 && (
                <span className="text-xs text-[#1a3a2e]/45">₦{product.price.toLocaleString()} each</span>
              )}
            </div>

            <p className="text-[#1a3a2e]/60 text-sm leading-relaxed whitespace-pre-line mb-6 flex-1">
              {product.description}
            </p>

            {product.countInStock != null && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#1a3a2e]/35 mb-4">
                {product.countInStock > 0
                  ? `${product.countInStock} in stock`
                  : "Out of stock"}
              </p>
            )}

            {/* Quantity stepper */}
            <AnimatePresence>
              {quantity > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mb-3 overflow-hidden"
                >
                  <button
                    onClick={() => onDecrement(product._id)}
                    className="w-9 h-9 bg-[#1a3a2e]/8 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="text-[10px] text-[#1a3a2e]" />
                  </button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="w-9 text-center font-bold text-[#1a3a2e] text-sm"
                  >
                    {quantity}
                  </motion.span>
                  <button
                    onClick={() => onIncrement(product._id)}
                    disabled={quantity >= product.countInStock}
                    className="w-9 h-9 bg-[#1a3a2e]/8 hover:bg-green-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <FaPlus className="text-[10px] text-[#1a3a2e]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2.5 mt-auto pt-2">
              {quantity === 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAddToCart(product)}
                  className="w-full py-3 bg-[#1a3a2e] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <FaShoppingCart className="text-xs" /> Add to Cart
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#20b858" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPurchaseNow(product)}
                className="w-full py-3 bg-[#25D366] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FaWhatsapp /> Purchase Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  index,
  quantity,
  onAddToCart,
  onIncrement,
  onDecrement,
  onWishlist,
  isWishlisted,
  onPurchaseNow,
  onCardClick,
}) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.06 }}
    >
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.13)" }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={() => onCardClick(product)}
        className="group bg-white rounded-3xl overflow-hidden h-full flex flex-col cursor-pointer"
        style={{ boxShadow: T.clay }}
      >
        {/* ── Image ── */}
        <div className="relative overflow-hidden h-52 sm:h-56">
          <LazyImage src={product.image} alt={product.name} className="w-full h-full" />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: CATEGORY_META[product.category]?.color || T.green, opacity: 0.92 }}
            >
              {product.category}
            </span>
          </div>

          {/* Wishlist button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => { e.stopPropagation(); onWishlist(product._id); }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center shadow-md"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <motion.div animate={isWishlisted ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
              <FaHeart className={`text-sm transition-colors ${isWishlisted ? "text-red-500" : "text-gray-300"}`} />
            </motion.div>
          </motion.button>
        </div>

        {/* ── Content ── */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-base text-[#1a3a2e] mb-1 leading-snug line-clamp-2" style={{ fontFamily: T.fontDisplay }}>
            {product.name}
          </h3>
          <p className="text-[#1a3a2e]/55 text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-[#1a3a2e]" style={{ fontFamily: T.fontDisplay }}>
              ₦{(quantity > 0 ? product.price * quantity : product.price).toLocaleString()}
            </span>
            {quantity > 1 && (
              <span className="text-xs text-[#1a3a2e]/45">₦{product.price.toLocaleString()} each</span>
            )}
          </div>

          {/* Quantity stepper */}
          <AnimatePresence>
            {quantity > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-3 overflow-hidden"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onDecrement(product._id); }}
                  className="w-8 h-8 bg-[#1a3a2e]/8 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FaMinus className="text-[10px] text-[#1a3a2e]" />
                </button>
                <motion.span
                  key={quantity}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="w-8 text-center font-bold text-[#1a3a2e] text-sm"
                >
                  {quantity}
                </motion.span>
                <button
                  onClick={(e) => { e.stopPropagation(); onIncrement(product._id); }}
                  disabled={quantity >= product.countInStock}
                  className="w-8 h-8 bg-[#1a3a2e]/8 hover:bg-green-50 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Increase quantity"
                >
                  <FaPlus className="text-[10px] text-[#1a3a2e]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Blocked Reason Error Message */}
          {quantity >= product.countInStock && (
            <motion.p 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-mono uppercase tracking-widest text-red-500 mt-2 font-bold"
            >
              Maximum available units reached ({product.countInStock} left)
            </motion.p>
          )}

          {/* Add to cart — only when qty = 0 */}
          <AnimatePresence mode="wait">
            {quantity === 0 && (
              <motion.button
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                className="w-full py-2.5 bg-[#1a3a2e] text-white rounded-full font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
              >
                <FaShoppingCart className="text-xs" /> Add to Cart
              </motion.button>
            )}
          </AnimatePresence>

          {/* WhatsApp direct purchase */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#20b858" }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.stopPropagation(); onPurchaseNow(product); }}
            className="w-full py-2.5 bg-[#25D366] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <FaWhatsapp /> Purchase Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CART SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const CartSidebar = ({
  cartItems,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  totalPrice,
  onCheckout,
  isCheckingOut,
}) => {
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  const whatsappMessage =
    "Hello! I want to purchase:\n" +
    cartItems
      .map(i => `• ${i.name} x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`)
      .join("\n") +
    `\n\nTotal: ₦${totalPrice.toLocaleString()}`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed top-0 right-0 w-full max-w-sm sm:max-w-md bg-white h-full z-50 flex flex-col shadow-2xl"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1a3a2e] rounded-2xl flex items-center justify-center">
              <FaShoppingCart className="text-[#d4af37] text-sm" />
            </div>
            <div>
              <h2 style={{ fontFamily: T.fontDisplay }} className="text-xl font-bold text-[#1a3a2e]">
                My Cart
              </h2>
              <p className="text-[#1a3a2e]/45 text-xs">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <FaTimes className="text-[#1a3a2e] text-sm" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {cartItems.length > 0 ? (
              cartItems.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.28 }}
                  className="flex gap-3 bg-stone-50 p-3 rounded-2xl"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-[72px] h-[72px] rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a3a2e] text-sm leading-tight mb-1 truncate">
                      {item.name}
                    </p>
                    <p className="text-[#d4af37] font-bold text-sm">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                    {item.quantity >= item.countInStock && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-mono uppercase tracking-widest text-red-500 mt-2 font-bold"
                    >
                      Maximum available units reached ({item.countInStock} left)
                    </motion.p>
                  )}

                    <div className="flex items-center gap-2 mt-2">
                      {/* Decrement / remove-if-zero */}
                      <button
                        onClick={() => onDecrement(item._id)}
                        className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <FaMinus className="text-[9px] text-[#1a3a2e]" />
                      </button>

                      <span className="text-sm font-semibold w-5 text-center text-[#1a3a2e]">
                        {item.quantity}
                      </span>

                      {/* Increment */}
                      <button
                        onClick={() => onIncrement(item._id)}
                        disabled={item.quantity >= item.countInStock}
                        className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-green-50 transition-colors"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <FaPlus className="text-[9px] text-[#1a3a2e]" />
                      </button>

                      {/* Hard remove */}
                      <button
                        onClick={() => onRemove(item._id)}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors p-1"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full pt-16 pb-8"
              >
                <EmptyCartIllustration />
                <p style={{ fontFamily: T.fontDisplay }} className="text-lg font-bold text-[#1a3a2e]/50 mb-1">
                  Your cart is empty
                </p>
                <p className="text-sm text-[#1a3a2e]/35 text-center">
                  Add some natural goodness to get started!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-stone-100 bg-white space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#1a3a2e]/60 font-medium">Total</span>
              <span style={{ fontFamily: T.fontDisplay }} className="text-2xl font-bold text-[#d4af37]">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>

            {/* PRIMARY: Proceed to Checkout → Paystack via backend */}
            <motion.button
              whileHover={!isCheckingOut ? { scale: 1.02 } : {}}
              whileTap={!isCheckingOut ? { scale: 0.97 } : {}}
              onClick={onCheckout}
              disabled={isCheckingOut}
              className="w-full bg-[#1a3a2e] text-white py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 8px 24px rgba(26,58,46,0.3)" }}
            >
              {isCheckingOut ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <FaSpinner className="text-base" />
                  </motion.span>
                  Processing…
                </>
              ) : (
                <>
                  <FaLock className="text-sm" /> Proceed to Checkout
                </>
              )}
            </motion.button>

            {/* FALLBACK: WhatsApp */}
            <a
              href={`https://wa.me/${VENDOR_PHONE}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 px-6 rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
              style={{ boxShadow: "0 6px 18px rgba(37,211,102,0.25)" }}
            >
              <FaWhatsapp /> Order via WhatsApp instead
            </a>
          </div>
        )}
      </motion.aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TeeNaturalProducts = () => {
  // ── Cart state — self-contained reducer, _id is the single key
  const [cartItems, cartDispatch] = useReducer(cartReducer, []);

  // ── Product fetch state
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── UI state
  const [cartOpen,         setCartOpen]         = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [wishlist,         setWishlist]          = useState([]);
  const [searchQuery,      setSearchQuery]       = useState("");
  const [prevCartCount,    setPrevCartCount]     = useState(0);
  const [selectedProduct,  setSelectedProduct]   = useState(null);

  // ── Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ── Derived values
  const totalCartQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartBounce   = totalCartQty > prevCartCount;
  const categories   = ["ALL", ...new Set(products.map(p => p.category))];

  const filteredProducts = products
    .filter(p => selectedCategory === "ALL" || p.category === selectedCategory)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get(`/products`);
      // Handles both plain array and { products: [...] } response shapes
      setProducts(Array.isArray(data) ? data : (data.products ?? []));
    } catch (err) {
      setFetchError(
        err?.response?.data?.message || err?.message || "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Cart action handlers (all keyed on _id)
  const getQuantity = (_id) => cartItems.find(i => i._id === _id)?.quantity ?? 0;

  const handleAddToCart = (product) => {
    setPrevCartCount(totalCartQty);
    cartDispatch({ type: "ADD_ITEM", payload: product });
  };

  const handleIncrement = (_id) => {
    setPrevCartCount(totalCartQty);
    cartDispatch({ type: "INCREMENT", payload: _id });
  };

  const handleDecrement = (_id) => {
    setPrevCartCount(totalCartQty);
    cartDispatch({ type: "DECREMENT", payload: _id });
  };

  const handleRemove = (_id) => {
    cartDispatch({ type: "REMOVE", payload: _id });
  };

  const toggleWishlist = (_id) =>
    setWishlist(prev =>
      prev.includes(_id) ? prev.filter(i => i !== _id) : [...prev, _id]
    );

  const handlePurchaseNow = (product) => {
    const qty = getQuantity(product._id);
    const price = qty > 0 ? product.price * qty : product.price;
    const qtyLabel = qty > 0 ? ` x${qty}` : "";
    const text = `Hi! I'd like to purchase *${product.name}*${qtyLabel} for ₦${price.toLocaleString()}`;
    window.open(`https://wa.me/${VENDOR_PHONE}?text=${encodeURIComponent(text)}`);
  };

  // ── Product detail modal handlers
  const handleCardClick = (product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  // ── Checkout: POST /api/orders → POST /api/orders/pay → Paystack redirect
  const handleCheckout = async () => {
  if (cartItems.length === 0) return;
  setIsCheckingOut(true);
  setCheckoutError(null);

  try {
    const token = localStorage.getItem("tn_token");
    const user = JSON.parse(localStorage.getItem("tn_user") || "{}");

    if (!token) throw new Error("Please log in to proceed to checkout.");
    if (!user.email) throw new Error("User email not found.");

    // Step 1: Create order
    const { data: order } = await api.post(
      `/orders`,
      {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalPrice: totalPrice, // Explicitly pass the total price
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const orderId = order._id;
    if (!orderId) throw new Error("Order creation failed.");

    // Step 2: Initialize Paystack
    // CRITICAL FIX: Multiply totalPrice by 100 because Paystack handles amounts in kobo/cents.
    // Inside your handleCheckout frontend function:
const { data: paystack } = await api.post(
  `/orders/pay`,
  {
    email: user.email,
    amount: totalPrice, // Just pass the raw price (e.g., 5000)
    orderId,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);


    // Step 3: Redirect to Paystack
    const paymentUrl = paystack?.data?.authorization_url;
    if (!paymentUrl) throw new Error("Unable to initialize payment.");

    // Optional: Clear your frontend cart here if your backend has successfully stored the unpaid order.
    // clearCart(); 

    window.location.href = paymentUrl;

  } catch (err) {
    console.error("Checkout error:", err);
    setCheckoutError(
      err.response?.data?.message || err.message || "Checkout failed."
    );
    setIsCheckingOut(false); // Only set to false on error, since success redirects away.
  }
};


  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-16" style={{ fontFamily: T.fontBody }}>

      {/* ══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <header className="text-center max-w-4xl mx-auto px-4 mb-10 pt-8">
        <HeaderBotanical />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            style={{ fontFamily: T.fontDisplay }}
            className="text-4xl sm:text-5xl md:text-6xl text-[#1a3a2e] mb-3 leading-tight"
          >
            Our Best Selling{" "}
            <span className="text-[#d4af37]">Products</span>
          </h1>
          <p className="text-[#1a3a2e]/60 text-base sm:text-lg">
            Discover nature's finest — all 100% natural
          </p>
        </motion.div>
      </header>

      {/* ══ SEARCH + FILTERS ═════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8">

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative max-w-md mx-auto mb-6"
        >
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a3a2e]/35 text-sm pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-3 bg-white rounded-full text-sm text-[#1a3a2e] placeholder-[#1a3a2e]/35 outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-shadow"
            style={{ boxShadow: T.clay }}
          />
        </motion.div>

        {/* Category pills — hidden during load / error */}
        {!loading && !fetchError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {categories.map((cat, i) => {
              const isActive = selectedCategory === cat;
              const meta     = CATEGORY_META[cat];
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    isActive
                      ? "text-white shadow-md"
                      : "bg-white text-[#1a3a2e] hover:bg-[#1a3a2e]/5"
                  }`}
                  style={{
                    backgroundColor: isActive ? T.green : undefined,
                    boxShadow: isActive ? "0 4px 16px rgba(26,58,46,0.3)" : T.clay,
                  }}
                >
                  <span className={isActive ? "text-[#d4af37]" : "text-[#1a3a2e]/50"}>
                    {meta?.icon}
                  </span>
                  {cat}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Result count */}
        {!loading && !fetchError && (
          <AnimatePresence mode="wait">
            <motion.p
              key={`${selectedCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[#1a3a2e]/40 text-xs mt-4"
            >
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      {/* ══ PRODUCT GRID / SKELETON / ERROR ══════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <ErrorState message={fetchError} onRetry={fetchProducts} />
        )}

        {/* Products */}
        {!loading && !fetchError && (
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={i}
                    quantity={getQuantity(product._id)}
                    onAddToCart={handleAddToCart}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(product._id)}
                    onPurchaseNow={handlePurchaseNow}
                    onCardClick={handleCardClick}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <EmptyCartIllustration />
                <p style={{ fontFamily: T.fontDisplay }} className="text-xl text-[#1a3a2e]/50">
                  No products found
                </p>
                <p className="text-sm text-[#1a3a2e]/35 mt-2">
                  Try a different search or category
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ══ FLOATING CART BUTTON ═════════════════════════════════════════════ */}
      <motion.button
        onClick={() => setCartOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        animate={cartBounce ? { scale: [1, 1.2, 0.95, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 bg-[#d4af37] w-14 h-14 sm:w-16 sm:h-16 rounded-full text-[#1a3a2e] flex items-center justify-center z-30"
        style={{ boxShadow: "0 8px 32px rgba(212,175,55,0.5), 0 2px 8px rgba(0,0,0,0.12)" }}
        aria-label={`Open cart — ${totalCartQty} items`}
      >
        {totalCartQty > 0 && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#d4af37]"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <FaShoppingCart className="text-lg relative z-10" />
        <AnimatePresence>
          {totalCartQty > 0 && (
            <motion.span
              key={totalCartQty}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 bg-[#1a3a2e] text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs flex items-center justify-center font-bold z-10"
            >
              {totalCartQty}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ══ CART SIDEBAR ═════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cartOpen && (
          <CartSidebar
            cartItems={cartItems}
            onClose={() => setCartOpen(false)}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            totalPrice={totalPrice}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        )}
      </AnimatePresence>

      {/* ══ PRODUCT DETAIL MODAL ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={handleCloseModal}
            quantity={getQuantity(selectedProduct._id)}
            onAddToCart={handleAddToCart}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onPurchaseNow={handlePurchaseNow}
          />
        )}
      </AnimatePresence>

      {/* ══ CHECKOUT ERROR TOAST ═════════════════════════════════════════════ */}
      <CheckoutErrorToast
        message={checkoutError}
        onClose={() => setCheckoutError(null)}
      />

    </div>
  );
};

export default TeeNaturalProducts;