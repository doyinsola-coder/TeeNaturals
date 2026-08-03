import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaShoppingBag, FaLeaf } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";





const T = {
  green:       "#1a3a2e",
  greenMid:    "#2d5a47",
  adminBg:     "#0e1a14",   // darker for admin — clearly different feel
  gold:        "#d4af37",
  goldLight:   "#f0d060",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",
};

export const NavSpacer = () => (
  <div aria-hidden="true" style={{ height: "72px", flexShrink: 0 }} />
);

 

const NAV_LINKS = [
  {
    name: "About",
    href: "/about",
    Icon: () => (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="8" cy="5" r="3" fill="currentColor" opacity="0.9" />
        <path d="M2 14 Q2 10 8 10 Q14 10 14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
      </svg>
    ),
  },
  {
    name: "Reviews",
    href: "/reviews",
    Icon: () => (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M8 2 L9.5 6H14 L10.5 8.5 L12 12.5 L8 10 L4 12.5 L5.5 8.5 L2 6 H6.5Z" fill="currentColor" opacity="0.9" />
      </svg>
    ),
  },
  {
    name: "Contact Us",
    href: "/contact",
    Icon: () => (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
        <rect x="1" y="3" width="14" height="10" rx="3" fill="currentColor" opacity="0.8" />
        <path d="M1 5 L8 9.5 L15 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Consultation",
    href: "/consultation",
    Icon: () => (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
        <ellipse cx="8" cy="7" rx="5" ry="7" fill="currentColor" opacity="0.85" transform="rotate(-15,8,7)" />
        <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: "Spa Bookings",
    href: "/spa-bookings",
    Icon: () => (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" fill="currentColor" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a}
            cx={8 + Math.cos((a * Math.PI) / 180) * 4.5}
            cy={8 + Math.sin((a * Math.PI) / 180) * 4.5}
            rx="2" ry="3" fill="currentColor" opacity="0.55"
            transform={`rotate(${a},${8 + Math.cos((a * Math.PI) / 180) * 4.5},${8 + Math.sin((a * Math.PI) / 180) * 4.5})`}
          />
        ))}
      </svg>
    ),
  },
];


const ADMIN_LINKS = [
  { name: "Overview", href: "/admin",          icon: "◈" },
  // { name: "Products", href: "/admin/products",  icon: "🌿" },
  // { name: "Orders",   href: "/admin/orders",    icon: "📦" },
  // { name: "Users",    href: "/admin/users",     icon: "👥" },
];

const LogoLeafLeft = () => (
  <svg viewBox="0 0 32 40" fill="none" className="w-5 h-7 shrink-0" aria-hidden="true">
    <path d="M16 38 Q16 20 8 10 Q4 5 10 2 Q18 5 20 18 Q22 28 16 38Z" fill="#4a9a6b" />
    <line x1="16" y1="38" x2="16" y2="8" stroke="#2d5a47" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 20 Q10 16 8 10" stroke="#2d5a47" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M16 28 Q20 22 20 16" stroke="#2d5a47" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const LogoLeafRight = () => (
  <svg viewBox="0 0 32 40" fill="none" className="w-5 h-7 shrink-0" aria-hidden="true">
    <path d="M16 38 Q16 20 24 10 Q28 5 22 2 Q14 5 12 18 Q10 28 16 38Z" fill="#6dbf82" />
    <line x1="16" y1="38" x2="16" y2="8" stroke="#4a9a6b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 20 Q22 16 24 10" stroke="#4a9a6b" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M16 28 Q12 22 12 16" stroke="#4a9a6b" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const DrawerIllustration = () => (
  <svg viewBox="0 0 360 100" fill="none"
    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true">
    <path d="M0 80 Q50 50 100 65 Q130 75 160 55" stroke="#d4af37" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <ellipse cx="55"  cy="52" rx="16" ry="9" fill="#4a9a6b" transform="rotate(-30,55,52)" />
    <ellipse cx="100" cy="62" rx="13" ry="7" fill="#6dbf82" transform="rotate(-12,100,62)" />
    <ellipse cx="28"  cy="68" rx="12" ry="6" fill="#2d5a47" transform="rotate(-45,28,68)" />
    <path d="M360 80 Q310 50 260 65 Q230 75 200 55" stroke="#d4af37" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <ellipse cx="305" cy="52" rx="16" ry="9" fill="#4a9a6b" transform="rotate(30,305,52)" />
    <ellipse cx="260" cy="62" rx="13" ry="7" fill="#6dbf82" transform="rotate(12,260,62)" />
    <ellipse cx="332" cy="68" rx="12" ry="6" fill="#2d5a47" transform="rotate(45,332,68)" />
    {[160, 200, 240].map((x, i) => (
      <g key={i} transform={`translate(${x},38)`}>
        <circle r="5" fill="#d4af37" opacity="0.9" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a}
            cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9}
            rx="4" ry="5" fill="#f0d060" opacity="0.6"
            transform={`rotate(${a},${Math.cos((a * Math.PI) / 180) * 9},${Math.sin((a * Math.PI) / 180) * 9})`}
          />
        ))}
      </g>
    ))}
    {[{ x: 140, y: 18 }, { x: 220, y: 15 }, { x: 300, y: 30 }, { x: 62, y: 30 }].map((s, i) => (
      <g key={i} transform={`translate(${s.x},${s.y})`}>
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#d4af37" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
      </g>
    ))}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Logo block
// ─────────────────────────────────────────────────────────────────────────────
const NavLogo = ({ to = "/" }) => (
  <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
    <Link to={to} className="flex items-center gap-1 sm:gap-1.5" aria-label="TeeNatural — home">
      <motion.div className="hidden sm:block"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <LogoLeafLeft />
      </motion.div>
      <motion.img
        src="/favicon.jpg" alt="TeeNatural logo"
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#d4af37]/40 shrink-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <span style={{ fontFamily: T.fontDisplay }}
        className="text-white font-bold leading-tight whitespace-nowrap text-sm sm:text-base lg:text-[17px]">
        Tee Natural
        <span className="text-[#d4af37] mx-0.5">&</span>
        Essentials
      </span>
      <motion.div className="hidden sm:block"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
        <LogoLeafRight />
      </motion.div>
    </Link>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Avatar initials circle
// ─────────────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "sm" }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const cls = size === "lg"
    ? "w-10 h-10 text-[14px]"
    : size === "md"
    ? "w-8 h-8 text-[12px]"
    : "w-7 h-7 text-[11px]";
  return (
    <div className={`${cls} rounded-xl shrink-0 flex items-center justify-center
      font-bold text-[#1a3a2e] bg-linear-to-br from-[#d4af37] to-[#f0d060]
      shadow-[0_2px_8px_rgba(212,175,55,0.45)]`}>
      {initials}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Dropdown chevron button wrapper
// ─────────────────────────────────────────────────────────────────────────────
const ChevronSvg = ({ open }) => (
  <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}
    className="w-3.5 h-3.5 text-white/35 shrink-0"
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </motion.svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// USER DROPDOWN (used in guest "dashboard" link hint + user dropdown)
// ─────────────────────────────────────────────────────────────────────────────
const UserDropdown = ({ profile, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "Account";

  return (
    <div className="relative" ref={ref}>
      <motion.button whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
          bg-white/10 hover:bg-white/18 border border-white/15 hover:border-white/25
          transition-all duration-200"
        aria-label="Account menu" aria-expanded={open}>
        <Avatar name={profile?.name} size="sm" />
        <div className="text-left leading-none hidden sm:block">
          <span className="block text-[12px] font-bold text-white truncate max-w-[90px]">
            {firstName}
          </span>
          <span className="block text-[9px] font-semibold tracking-widest uppercase text-[#d4af37]/70 mt-0.5">
            Member
          </span>
        </div>
        <ChevronSvg open={open} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] overflow-hidden z-50"
            style={{
              minWidth: 230,
              background: T.green,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.45), 0 3px 12px rgba(0,0,0,0.3)",
            }}>
            {/* gold top line */}
            <div className="h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-70" />

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/10"
              style={{ background: "linear-gradient(135deg,#1a3a2e,#2d5a47)" }}>
              <div className="flex items-center gap-2.5">
                <Avatar name={profile?.name} size="md" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate"
                    style={{ fontFamily: T.fontDisplay }}>{profile?.name}</p>
                  <p className="text-[11px] text-white/45 truncate">{profile?.email}</p>
                </div>
              </div>
              {/* Member badge */}
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                  font-bold tracking-widest uppercase
                  bg-[rgba(61,122,96,0.2)] text-[#6dbf82] border border-[rgba(61,122,96,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6dbf82]"
                    style={{ boxShadow: "0 0 5px #6dbf82" }} />
                  Member
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="py-1.5">
              {[
                { icon: "🏠", label: "My Dashboard",  to: "/dashboard"          },
                { icon: "👤", label: "My Profile",    to: "/dashboard/profile"   },
              ].map((item) => (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold
                    text-white/65 hover:text-white hover:bg-white/07
                    transition-colors duration-150">
                  <span>{item.icon}</span>{item.label}
                </Link>
              ))}
              <div className="mx-3 my-1.5 h-px bg-white/08" />
              <button onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold
                  text-[rgba(218,80,70,0.85)] hover:text-[rgba(218,80,70,1)]
                  hover:bg-[rgba(218,54,51,0.08)] transition-colors duration-150">
                <span>🚪</span> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
const AdminDropdown = ({ profile, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const firstName = profile?.name?.split(" ")[0] || "Admin";
  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <div className="relative" ref={ref}>
      <motion.button whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
          bg-white/08 hover:bg-white/14 border border-white/12 hover:border-[rgba(212,175,55,0.35)]
          transition-all duration-200"
        aria-expanded={open}>
        {/* Gold admin avatar */}
        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center
          text-[11px] font-bold text-[#0e1a14]
          bg-linear-to-br from-[#d4af37] to-[#f0d060]
          shadow-[0_2px_8px_rgba(212,175,55,0.5)]">
          {initials}
        </div>
        <span className="text-[12px] font-bold text-white hidden sm:block truncate max-w-20">
          {firstName}
        </span>
        <ChevronSvg open={open} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] overflow-hidden z-50"
            style={{
              minWidth: 230,
              background: T.adminBg,
              borderRadius: 18,
              border: "1px solid rgba(212,175,55,0.15)",
              boxShadow: "0 16px 56px rgba(0,0,0,0.6), 0 3px 12px rgba(0,0,0,0.4)",
            }}>
            {/* gold top line */}
            <div className="h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-80" />

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/08"
              style={{ background: "linear-gradient(135deg,#1a3a2e,#0e1a14)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center
                  text-[14px] font-bold text-[#0e1a14]
                  bg-linear-to-br from-[#d4af37] to-[#f0d060]">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate"
                    style={{ fontFamily: T.fontDisplay }}>{profile?.name}</p>
                  <p className="text-[11px] text-white/40 truncate">{profile?.email}</p>
                </div>
              </div>
              {/* Admin badge */}
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                  font-bold tracking-widest uppercase
                  bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                    style={{ boxShadow: "0 0 5px #d4af37" }} />
                  Administrator
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="py-1.5">
              <Link to="/admin/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold
                  text-white/55 hover:text-white hover:bg-white/05 transition-colors duration-150">
                <span>⚙️</span> Settings
              </Link>
              <div className="mx-3 my-1.5 h-px bg-white/07" />
              <button onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold
                  text-[rgba(218,80,70,0.85)] hover:text-[rgba(218,80,70,1)]
                  hover:bg-[rgba(218,54,51,0.08)] transition-colors duration-150">
                <span>🚪</span> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DRAWER PANEL (guest + user share the same drawer)
// ─────────────────────────────────────────────────────────────────────────────
const MobileDrawer = ({ open, onClose, profile, onLogout }) => {
  const location = useLocation();

  return (
  <AnimatePresence>
    {open && (
      <>
        {/* backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true" />

        {/* panel */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-3 right-3 sm:left-4 sm:right-4 bg-[#1a3a2e] rounded-2xl sm:rounded-3xl
            z-50 overflow-hidden border border-white/10 lg:hidden"
          style={{ top: "68px", boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)" }}>

          {/* illustrated header */}
          <div className="relative px-6 pt-5 pb-4 overflow-hidden border-b border-white/10">
            <DrawerIllustration />
            <div className="relative z-10 flex items-center gap-3">
              <motion.img src="/favicon.jpg" alt="TeeNatural"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d4af37]/50 shrink-0"
                animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} />
              <div>
                <p style={{ fontFamily: T.fontDisplay }}
                  className="text-white font-bold text-lg leading-tight">
                  Tee Natural <span className="text-[#d4af37]">&</span> Essentials
                </p>
                {/* show name if logged in, tagline if not */}
                {profile ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[#d4af37]/80 text-xs font-semibold">
                      Welcome back, {profile.name?.split(" ")[0]}!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FaLeaf className="text-[#4a9a6b] text-[10px]" aria-hidden="true" />
                    <span className="text-white/45 text-xs">100% Natural Products</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* nav links */}
          <nav className="px-4 py-3" aria-label="Mobile navigation">
            {NAV_LINKS.map((link, i) => {
              const active = location.pathname === link.href;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.06, duration: 0.32 }}>
                  <Link to={link.href} onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-all group
                      ${active
                        ? "bg-[#d4af37]/15 text-[#d4af37]"
                        : "text-white/80 hover:bg-white/08 hover:text-white"
                      }`}>
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${active ? "bg-[#d4af37] text-[#1a3a2e]" : "bg-white/10 text-white/55 group-hover:bg-white/15"}`}>
                      <link.Icon />
                    </span>
                    <span className="font-medium text-sm flex-1">{link.name}</span>
                    {active && <motion.span layoutId="mobileActiveDot"
                      className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* leaf divider */}
          <div className="flex items-center mx-6 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mx-3 text-[#d4af37]/40" aria-hidden="true">
              <ellipse cx="12" cy="11" rx="7" ry="11" fill="currentColor" opacity="0.6" />
              <line x1="12" y1="2" x2="12" y2="22" stroke="#1a3a2e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* auth-specific bottom section */}
          <div className="px-4 pb-5 flex flex-col gap-2">
            {!profile ? (
              /* Guest: Dashboard outline + Login gold */
              <>
                <Link to="/dashboard" onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                    text-[13px] font-bold text-white/80
                    border border-white/20 hover:border-white/35 hover:bg-white/05
                    transition-all">
                  Dashboard
                </Link>
                <Link to="/login" onClick={onClose}
                  className="relative flex items-center justify-center gap-2.5 w-full
                    bg-[#d4af37] hover:bg-[#c29d2f] text-[#1a3a2e] py-3.5 rounded-2xl
                    font-bold text-base transition-colors overflow-hidden group"
                  style={{ boxShadow: "0 8px 24px rgba(212,175,55,0.4)" }}>
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent
                    -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                  <FaShoppingBag className="text-sm relative z-10" aria-hidden="true" />
                  <span className="relative z-10">Login to Shop</span>
                </Link>
              </>
            ) : (
              /* User: Shop Now + My Dashboard + Sign out */
              <>
                <Link to="/products" onClick={onClose}
                  className="relative flex items-center justify-center gap-2.5 w-full
                    bg-[#d4af37] hover:bg-[#c29d2f] text-[#1a3a2e] py-3.5 rounded-2xl
                    font-bold text-base transition-colors overflow-hidden group"
                  style={{ boxShadow: "0 8px 24px rgba(212,175,55,0.4)" }}>
                  <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent
                    -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                  <FaShoppingBag className="text-sm relative z-10" />
                  <span className="relative z-10">Shop Now</span>
                </Link>
                <Link to="/dashboard" onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                    text-[13px] font-bold text-white/75 border border-white/18
                    hover:bg-white/06 hover:border-white/30 transition-all">
                  🏠 My Dashboard
                </Link>
                <button onClick={() => { onClose(); onLogout(); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                    text-[13px] font-bold text-[rgba(218,80,70,0.85)]
                    border border-[rgba(218,54,51,0.25)] hover:bg-[rgba(218,54,51,0.08)]
                    transition-all">
                  🚪 Sign out
                </button>
              </>
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MOBILE DRAWER — dark, gold accents, admin links only
// ─────────────────────────────────────────────────────────────────────────────
const AdminMobileDrawer = ({ open, onClose, profile, onLogout }) => {
  const location = useLocation();
  const isActive = (to) => to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true" />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-3 right-3 sm:left-4 sm:right-4 rounded-2xl sm:rounded-3xl z-50 overflow-hidden lg:hidden"
            style={{ top: "68px", background: T.adminBg, border: "1px solid rgba(212,175,55,0.18)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)" }}>

            {/* gold top accent */}
            <div className="h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-70" />

            {/* Admin header */}
            <div className="px-5 pt-5 pb-4 border-b border-white/08"
              style={{ background: "linear-gradient(135deg,#1a3a2e,#0e1a14)" }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center
                  text-[15px] font-bold text-[#0e1a14]
                  bg-linear-to-br from-[#d4af37] to-[#f0d060]
                  shadow-[0_3px_12px_rgba(212,175,55,0.5)]">
                  {profile?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "A"}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white" style={{ fontFamily: T.fontDisplay }}>
                    {profile?.name}
                  </p>
                  <p className="text-[11px] text-white/40">{profile?.email}</p>
                </div>
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                  font-bold tracking-widest uppercase
                  bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                    style={{ boxShadow: "0 0 5px #d4af37" }} />
                  Administrator
                </span>
              </div>
            </div>

            {/* Admin links */}
            <nav className="px-4 py-3">
              {ADMIN_LINKS.map((link, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.06 }}>
                  <Link to={link.href} onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-all
                      ${isActive(link.href)
                        ? "bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.2)]"
                        : "text-white/55 hover:text-white hover:bg-white/05 border border-transparent"
                      }`}>
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                      bg-white/06 text-base">
                      {link.icon}
                    </span>
                    <span className="font-semibold text-sm">{link.name}</span>
                    {isActive(link.href) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                        style={{ boxShadow: "0 0 6px #d4af37" }} />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Admin bottom actions */}
            <div className="px-4 pb-5 border-t border-white/07 pt-3 flex flex-col gap-2">
              <Link to="/admin/settings" onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                  text-[13px] font-bold text-white/65 border border-white/12
                  hover:bg-white/05 hover:text-white transition-all">
                ⚙️ Settings
              </Link>
              <button onClick={() => { onClose(); onLogout(); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                  text-[13px] font-bold text-[rgba(218,80,70,0.85)]
                  border border-[rgba(218,54,51,0.25)] hover:bg-[rgba(218,54,51,0.1)]
                  transition-all">
                🚪 Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


const TeeNaturalNavbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  // scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // fetch profile
  useEffect(() => {
    const token = localStorage.getItem("tn_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/profile")
      .then((r) => setProfile(r.data))
      .catch(() => { setProfile(null); localStorage.removeItem("tn_token"); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("tn_token");
    localStorage.removeItem("tn_user");
    setProfile(null);
    setMenuOpen(false);
    navigate("/login");
  }, [navigate]);

  const isAdmin = profile?.role === "admin";
  const isUser  = profile && !isAdmin;

  const isActive = (href) => location.pathname === href;

  if (!loading && isAdmin) {
    return (
      <>
        <motion.nav
          initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Admin navigation"
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(14,26,20,0.99)" : "rgba(14,26,20,0.96)",
            backdropFilter: "blur(16px)",
            boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.5)" : "none",
            borderBottom: "1px solid rgba(212,175,55,0.12)",
            fontFamily: T.fontBody,
          }}>
          {/* Gold top border */}
          <div className="absolute top-0 left-0 right-0 h-0.5
            bg-linear-to-r from-transparent via-[#d4af37] to-transparent opacity-65" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
            {/* Logo */}
            <NavLogo to="/" />

            {/* Separator */}
            <div className="hidden lg:block w-px h-5 bg-white/12 shrink-0" />

            {/* Admin badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                style={{ boxShadow: "0 0 6px #d4af37" }} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#d4af37]">Admin</span>
            </div>

            {/* Admin links */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-none" aria-label="Admin pages">
              {ADMIN_LINKS.map((link) => {
                const active = link.href === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(link.href);
                return (
                  <Link key={link.href} to={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold
                      transition-all duration-200 whitespace-nowrap
                      ${active
                        ? "bg-[rgba(212,175,55,0.15)] text-[#d4af37] border border-[rgba(212,175,55,0.22)]"
                        : "text-white/50 hover:text-white hover:bg-white/06 border border-transparent"
                      }`}>
                    <span className="text-[13px]">{link.icon}</span>
                    {link.name}
                    {active && (
                      <motion.span layoutId="adminActiveBar"
                        className="w-1.5 h-1.5 rounded-full bg-[#d4af37] ml-0.5"
                        style={{ boxShadow: "0 0 6px #d4af37" }} />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-1" />

            {/* Admin dropdown (desktop) */}
            <div className="hidden lg:block">
              <AdminDropdown profile={profile} onLogout={handleLogout} />
            </div>

            {/* Hamburger (mobile) */}
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex lg:hidden w-9 h-9 bg-white/08 hover:bg-white/14 rounded-full
                items-center justify-center transition-colors shrink-0 border border-white/10"
              aria-label={menuOpen ? "Close menu" : "Open menu"}>
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FaTimes className="text-white text-base" />
                    </motion.div>
                  : <motion.div key="bars" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FaBars className="text-white text-base" />
                    </motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>

        <AdminMobileDrawer
          open={menuOpen} onClose={() => setMenuOpen(false)}
          profile={profile} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#1a3a2e] backdrop-blur-xl ${
          scrolled
            ? "shadow-[0_4px_32px_rgba(0,0,0,0.3)] py-2"
            : "py-3"
        }`}
        style={{ fontFamily: T.fontBody }}>

        {/* gold accent bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px
          bg-linear-to-r from-transparent via-[#d4af37]/35 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center">

          {/* COL 1: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <NavLogo to="/" />
          </div>

          {/* COL 2: Desktop links — always centered */}
          <nav className="hidden lg:flex items-center flex-none" aria-label="Site pages">
            {NAV_LINKS.map((link, i) => (
              <Link key={i} to={link.href}
                className="relative group px-3 xl:px-4 py-2"
                aria-current={isActive(link.href) ? "page" : undefined}>
                <span className={`flex items-center gap-1.5 text-sm font-medium transition-colors
                  duration-200 whitespace-nowrap
                  ${isActive(link.href) ? "text-[#d4af37]" : "text-white/80 group-hover:text-[#d4af37]"}`}>
                  <span className={`transition-colors shrink-0
                    ${isActive(link.href) ? "text-[#d4af37]" : "text-white/35 group-hover:text-[#d4af37]"}`}>
                    <link.Icon />
                  </span>
                  {link.name}
                </span>
                <motion.span className="absolute bottom-0 left-3 xl:left-4 right-3 xl:right-4
                  h-0.5 bg-[#d4af37] rounded-full origin-left"
                  initial={{ scaleX: isActive(link.href) ? 1 : 0 }}
                  animate={{ scaleX: isActive(link.href) ? 1 : 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.22 }} />
              </Link>
            ))}
          </nav>

          {/* COL 3: Actions */}
          <div className="flex-1 flex items-center justify-end gap-2">

            {loading ? (
              /* Loading skeleton */
              <div className="w-24 h-8 rounded-xl bg-white/10 animate-pulse" />
            ) : isUser ? (
              /* ── LOGGED IN USER ── */
              <>
                {/* Shop Now — desktop */}
                <Link to="/products" className="hidden lg:block shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 28px rgba(212,175,55,0.5)" }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-[#d4af37] text-[#1a3a2e] px-5 py-2.5 rounded-full font-bold
                      text-sm flex items-center gap-2 shadow-lg whitespace-nowrap">
                    <FaShoppingBag className="text-xs" />
                    Shop Now
                  </motion.button>
                </Link>

                {/* Mobile cart icon */}
                <Link to="/products" className="flex lg:hidden shrink-0">
                  <motion.div whileTap={{ scale: 0.9 }}
                    className="relative w-9 h-9 bg-[#d4af37] rounded-full
                      flex items-center justify-center shadow-md">
                    <FaShoppingBag className="text-[#1a3a2e] text-sm" />
                  </motion.div>
                </Link>

                {/* Avatar + dropdown (desktop) */}
                <div className="hidden lg:block">
                  <UserDropdown profile={profile} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              /* ── GUEST ── */
              <>
                {/* Dashboard outline btn */}
                <Link to="/dashboard" className="hidden lg:block">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-full text-sm font-bold text-white/75
                      border border-white/20 hover:border-white/40 hover:text-white
                      transition-all duration-200 whitespace-nowrap">
                    Dashboard
                  </motion.button>
                </Link>

                {/* Shop Now gold btn */}
                <Link to="/products" className="hidden lg:block shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(212,175,55,0.45)" }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-[#d4af37] text-[#1a3a2e] px-5 py-2.5 rounded-full font-bold
                      text-sm flex items-center gap-2 shadow-lg whitespace-nowrap">
                    <FaShoppingBag className="text-xs" />
                    Shop Now
                  </motion.button>
                </Link>

                {/* Mobile cart */}
                <Link to="/products" className="flex lg:hidden shrink-0">
                  <motion.div whileTap={{ scale: 0.9 }}
                    className="relative w-9 h-9 bg-[#d4af37] rounded-full
                      flex items-center justify-center shadow-md">
                    <FaShoppingBag className="text-[#1a3a2e] text-sm" />
                  </motion.div>
                </Link>
              </>
            )}

            {/* Hamburger — mobile (both guest and user) */}
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex lg:hidden w-9 h-9 bg-white/10 hover:bg-white/18 rounded-full
                items-center justify-center transition-colors shrink-0"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}>
              <AnimatePresence mode="wait">
                {menuOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FaTimes className="text-white text-base" />
                    </motion.div>
                  : <motion.div key="bars" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FaBars className="text-white text-base" />
                    </motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer — guest & user share this */}
      <MobileDrawer
        open={menuOpen} onClose={() => setMenuOpen(false)}
        profile={isUser ? profile : null}
        onLogout={handleLogout}
      />
    </>
  );
};

export default TeeNaturalNavbar;