import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useSearchParams } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — TeeNatural brand
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  green:      "#1a3a2e",
  greenMid:   "#2d5a47",
  greenLight: "#3d7a60",
  greenPale:  "#eef5f1",
  gold:       "#d4af37",
  goldLight:  "#f0d060",
  goldPale:   "#fdf8e7",
  cream:      "#faf7f2",
  surface:    "#ffffff",
  surfaceEl:  "rgba(26,58,46,0.06)",
  red:        "#b43228",
  redBd:      "rgba(180,50,40,0.3)",
  border:     "rgba(26,58,46,0.09)",
  borderMid:  "rgba(26,58,46,0.16)",
  muted:      "rgba(26,58,46,0.45)",
  faint:      "rgba(26,58,46,0.06)",
  textPri:    "#1a3a2e",
  textSec:    "rgba(26,58,46,0.45)",
  fontDisplay:"'Playfair Display', Georgia, serif",
  fontAccent: "'Cormorant Garamond', Georgia, serif",
  fontBody:   "'Plus Jakarta Sans', sans-serif",
  shadow:     "0 1px 3px rgba(26,58,46,0.06), 0 4px 16px rgba(26,58,46,0.06)",
  shadowMd:   "0 4px 24px rgba(26,58,46,0.10), 0 1px 4px rgba(26,58,46,0.06)",
  shadowLg:   "0 24px 64px rgba(0,0,0,0.18)",
};



// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const shortId = (id = "") => `#${id.slice(-6).toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Spinner = ({ size = 20, color = T.green }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
    style={{
      width: size, height: size, borderRadius: "50%",
      border: `2.5px solid rgba(26,58,46,0.12)`,
      borderTopColor: color,
      flexShrink: 0,
    }}
  />
);

const Badge = ({ paid }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.04em", fontFamily: T.fontBody,
    background: paid ? "rgba(34,139,80,0.1)" : "rgba(212,175,55,0.13)",
    color: paid ? "#166534" : "#92600a",
    border: `1px solid ${paid ? "rgba(34,139,80,0.2)" : "rgba(212,175,55,0.3)"}`,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: paid ? "#22c55e" : T.gold,
      boxShadow: paid ? "0 0 0 3px rgba(34,197,94,0.2)" : `0 0 0 3px rgba(212,175,55,0.2)`,
    }} />
    {paid ? "Paid" : "Pending"}
  </span>
);

const RoleBadge = ({ role }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.05em", fontFamily: T.fontBody, textTransform: "uppercase",
    background: role === "admin" ? T.goldPale : T.greenPale,
    color: role === "admin" ? "#92600a" : T.greenMid,
    border: `1px solid ${role === "admin" ? "rgba(212,175,55,0.3)" : "rgba(45,90,71,0.2)"}`,
  }}>
    {role === "admin" ? "⭐ Admin" : "🌿 Member"}
  </span>
);

const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ textAlign: "center", padding: "56px 24px" }}>
    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
    <p style={{ fontFamily: T.fontDisplay, fontSize: 20, color: T.green, fontWeight: 700, marginBottom: 8 }}>{title}</p>
    <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.muted, marginBottom: action ? 20 : 0 }}>{sub}</p>
    {action && (
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={action.fn}
        style={{
          padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
          background: T.green, color: T.goldLight, fontFamily: T.fontBody,
          fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
        }}>
        {action.label}
      </motion.button>
    )}
  </div>
);

const StatCard = ({ icon, label, value, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -2, boxShadow: T.shadowMd }}
    style={{
      background: T.surface, borderRadius: 20, padding: "22px 24px",
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
      display: "flex", flexDirection: "column", gap: 4, transition: "box-shadow 0.2s",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        color: T.muted, fontFamily: T.fontBody }}>{label}</span>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: T.greenPale,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
        {icon}
      </div>
    </div>
    <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.green, lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
    { id: "home", icon: "🏠",  label: "Home"  },
  { id: "dashboard", icon: "◈",  label: "Dashboard"  },
  { id: "profile",   icon: "✦",  label: "Profile"    },
  { id: "orders",    icon: "📦", label: "Orders"     },
  { id: "products",  icon: "🌿", label: "Products"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, user, onLogout, mobileOpen, setMobileOpen }) => {
  const inner = (
    <div className="flex flex-col h-screen py-7">
      {/* Logo */}
      <div style={{ padding: "0 24px 28px", borderBottom: `1px solid ${T.border}` }}>
       {user && (
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold shadow-[0_2px_8px_rgba(26,58,46,0.2)]"
              style={{
                background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})`,
                color: T.goldLight,
                fontFamily: T.fontDisplay,
              }}
            >
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className=" text-right block">
              <div
                className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {user.name}
              </div>

              <div
                className="text-[11px] mx-2 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {user.role === "admin" ? "Administrator" : "Customer"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <motion.button key={item.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                background: isActive ? T.green : "transparent",
                color: isActive ? T.goldLight : T.muted,
                fontFamily: T.fontBody, fontSize: 14, fontWeight: isActive ? 700 : 500,
                textAlign: "left", width: "100%",
                transition: "background 0.18s, color 0.18s",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-pip" style={{ marginLeft: "auto", width: 6, height: 6,
                  borderRadius: "50%", background: T.gold }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User mini card */}
      {user && (
        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div style={{
            background: T.faint, borderRadius: 14, padding: "12px 14px",
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.goldLight, fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700,
              }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 700,
                  color: T.green, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onLogout}
              style={{
                width: "100%", padding: "8px", borderRadius: 9, border: `1px solid ${T.borderMid}`,
                background: "transparent", cursor: "pointer", fontFamily: T.fontBody,
                fontSize: 12, fontWeight: 700, color: "rgba(180,50,40,0.8)", letterSpacing: "0.04em",
              }}>
              Sign out
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: T.surface,
        borderRight: `1px solid ${T.border}`, height: "100vh",
        position: "sticky", top: 0, overflowY: "auto",
        display: "none",
      }} className="tn-sidebar-desktop">
        {inner}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40, backdropFilter: "blur(2px)" }} />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{
                position: "fixed", top: 0, left: 0, width: 260, height: "100vh",
                background: T.surface, zIndex: 50, overflowY: "auto",
                boxShadow: "4px 0 32px rgba(0,0,0,0.12)",
              }}>
              {inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Inline style for desktop sidebar visibility */}
      <style>{`
        @media (min-width: 1024px) { .tn-sidebar-desktop { display: block !important; } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,58,46,0.15); border-radius: 99px; }
        .tn-table { width: 100%; border-collapse: collapse; }
        .tn-table th { padding: 10px 16px; font-family: '${T.fontBody}'; font-size: 11px;
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(26,58,46,0.45); background: rgba(26,58,46,0.03);
          border-bottom: 1px solid rgba(26,58,46,0.08); text-align: left; }
        .tn-table td { padding: 14px 16px; font-family: '${T.fontBody}'; font-size: 13.5px;
          color: #1a3a2e; border-bottom: 1px solid rgba(26,58,46,0.06); }
        .tn-table tr:last-child td { border-bottom: none; }
        .tn-table tr { transition: background 0.15s; }
        .tn-table tr:hover td { background: rgba(26,58,46,0.025); }
        .tn-prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
        @media (max-width: 640px) { .tn-prod-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 400px) { .tn-prod-grid { grid-template-columns: 1fr; } }
        .tn-stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media (max-width: 640px) { .tn-stat-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 380px) { .tn-stat-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOP NAV
// ─────────────────────────────────────────────────────────────────────────────
const Topbar = ({ active, user, onLogout, onMenuClick }) => {
  const pageTitle = NAV.find(n => n.id === active)?.label || "Dashboard";
  
  return (
    <header style={{
      height: 64, background: T.surface, borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10,
      padding: "0 24px", position: "sticky", top: 0, zIndex: 30,
      boxShadow: "0 1px 0 rgba(26,58,46,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Hamburger — mobile only */}
        <button onClick={onMenuClick}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6,
            display: "flex", flexDirection: "column", gap: 4.5 }}
          className="tn-hamburger">
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 20, height: 2, background: T.green, borderRadius: 2, display: "block" }} />
          ))}
        </button>
        <div>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700,
            color: T.green, margin: 0, lineHeight: 1 }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="text-[17px] font-bold hidden md:block"
          style={{ fontFamily: T.fontDisplay, color: T.green }}
        >
          TeeNatural
        </div>
        <div
          className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[18px] shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
          style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})` }}
        >
          🌿
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .tn-hamburger { display: none !important; } .tn-username-block { display: block !important; } }
      `}</style>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: DASHBOARD OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const SectionDashboard = ({ user, orders, ordersLoading, setActive }) => {
  const totalOrders  = orders.length;
  const totalSpent   = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const paidOrders   = orders.filter(o => o.isPaid).length;
  const recentOrders = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const [greeting,     setGreeting]     = useState("");
   useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(130deg, ${T.green} 0%, ${T.greenMid} 70%, #0f2419 100%)`,
          borderRadius: 22, padding: "28px 32px", position: "relative", overflow: "hidden",
        }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: `rgba(212,175,55,0.1)`, filter: "blur(30px)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 80, width: 120, height: 120,
          borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: T.fontAccent, color: T.gold, fontSize: 15,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            {greeting}
          </p>
          <h2 style={{ fontFamily: T.fontDisplay, color: "white", fontSize: 28,
            fontWeight: 700, margin: "0 0 6px", lineHeight: 1.2 }}>
            {user?.name || "Natural Beauty Lover"} 🌿
          </h2>
          <p style={{ fontFamily: T.fontBody, color: "rgba(255,255,255,0.6)",
            fontSize: 14, margin: 0 }}>
            Here's a snapshot of your account activity.
          </p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="tn-stat-grid">
        <StatCard icon="📦" label="Total Orders"  value={ordersLoading ? "—" : totalOrders}        sub="All time"              delay={0.05} />
        <StatCard icon="💰" label="Total Spent"   value={ordersLoading ? "—" : fmt(totalSpent)}    sub="Across all orders"    delay={0.12} />
        <StatCard icon="✅" label="Paid Orders"   value={ordersLoading ? "—" : paidOrders}         sub={`${totalOrders - paidOrders} pending`} delay={0.19} />
      </div>

      {/* Recent orders mini table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, color: T.green, margin: 0 }}>
            Recent Orders
          </h3>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive("orders")}
            style={{ padding: "6px 14px", borderRadius: 9, border: `1px solid ${T.borderMid}`,
              background: "transparent", cursor: "pointer", fontFamily: T.fontBody,
              fontSize: 12, fontWeight: 700, color: T.greenMid, letterSpacing: "0.04em" }}>
            View all
          </motion.button>
        </div>

        {ordersLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
        ) : recentOrders.length === 0 ? (
          <EmptyState icon="📭" title="No orders yet"
            sub="Your orders will appear here once you've made a purchase."
            action={{ label: "Browse Products", fn: () => setActive("products") }} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tn-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 700, fontFamily: T.fontBody }}>{shortId(o._id)}</td>
                    <td style={{ color: T.muted }}>{fmtDate(o.createdAt)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(o.totalPrice)}</td>
                    <td><Badge paid={o.isPaid} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PROFILE
// ─────────────────────────────────────────────────────────────────────────────
const SectionProfile = ({ user, loading }) => {
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={32} /></div>
  );
  if (!user) return <EmptyState icon="👤" title="Profile unavailable" sub="Could not load your profile." />;

  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "U";
  const infoRows = [
    { label: "Full Name",  value: user.name,  icon: "✦" },
    { label: "Email",      value: user.email, icon: "◎" },
    { label: "Account ID", value: shortId(user._id), icon: "⬡" },
    { label: "Status",        value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1), icon: "★" },
  ];

  return (
    <div className="flex flex-col gap-5 w-full max-w-[640px]">
      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden"
      >
        {/* Header Band */}
        <div className="h-[100px]  overflow-hidden bg-linear-to-br from-[#1a3a2e] to-[#c5d207] oapcity-100 relative">
          {/* Blur ambient gold glow */}
          <div className="absolute -top-[30px] -right-[30px] w-40 h-40 rounded-full bg-[#d4af37]/12 blur-[20px]" />
          {/* Radial grid background */}
          <div className="absolute inset-0 opacity-100 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[20px_20px]" />
        </div>

        {/* Avatar Overlap Area */}
        <div className="px-2.5 pb-2.5">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-full z-10 bg-linear-to-br  from-[#d4af37] to-[#f3e5ab] flex items-center justify-center font-bold text-[28px] text-[#1a3a2e] border-4 border-white shadow-[0_4px_20px_rgba(26,58,46,0.2)] shrink-0"
            >
              {initials}
            </motion.div>
            <div className="pb-1">
              <RoleBadge role={user.role} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1a3a2e] mb-1 tracking-tight">
            {user.name}
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            {user.email}
          </p>
        </div>
      </motion.div>

      {/* Detail Rows */}
      {infoRows.map((row, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -12 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow p-4 px-5 flex items-center gap-3.5"
        >
          {/* Custom Icon rounded container */}
          <div className="w-9 h-9 rounded-10 bg-emerald-50 text-[#102a20] font-bold text-base flex items-center justify-center shrink-0">
            {row.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.07em] mb-0.5">
              {row.label}
            </div>
            <div className="text-sm font-semibold text-[#1a3a2e] truncate">
              {row.value === "User" ? 'Customer' : row.value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: ORDERS
// ─────────────────────────────────────────────────────────────────────────────
const SectionOrders = ({ orders, loading }) => {
  const [filter, setFilter] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const navigate = useNavigate();
  const filtered = filter === "all" ? orders
    : filter === "paid" ? orders.filter(o => o.isPaid)
    : orders.filter(o => !o.isPaid);

  const sorted = [...filtered].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const detail = orders.find(o => o._id === detailId);

  const Btn = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  danger = false,
  type = "button",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})`,
      color: T.goldLight,
      boxShadow: "0 2px 12px rgba(26,58,46,0.5)",
    },
    secondary: {
      background: T.surfaceEl,
      color: T.textPri,
      border: `1px solid ${T.border}`,
    },
    ghost: {
      background: "transparent",
      color: T.textSec,
      border: `1px solid ${T.border}`,
    },
    danger: {
      background: "rgba(218,54,51,0.15)",
      color: T.red,
      border: `1px solid ${T.redBd}`,
    },
    gold: {
      background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`,
      color: T.green,
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, opacity: 0.92 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[10px]
        font-bold tracking-wide
        transition-all duration-200
        ${sizeClasses[size]}
        ${(disabled || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={variantStyles[danger ? "danger" : variant]}
    >
      {loading && (
        <Spinner
          size={13}
          color={variant === "primary" ? T.goldLight : T.textSec}
        />
      )}
      {children}
    </motion.button>
  );
};
const Modal = ({ open, onClose, title, children, width=520 }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={onClose}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
            backdropFilter:"blur(4px)", zIndex:80 }} />
        <motion.div initial={{opacity:0,scale:0.94,y:20}} animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.94,y:20}}
          transition={{type:"spring",stiffness:300,damping:26}}
          style={{ position:"fixed", inset:0, zIndex:90,
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:T.surface, borderRadius:20, width:"100%", maxWidth:width,
            border:`1px solid ${T.border}`, boxShadow:T.shadowLg, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              background:`linear-gradient(135deg, ${T.green} 0%, ${T.greenMid} 100%)` }}>
              <h3 style={{ fontFamily:T.fontDisplay, fontSize:18, fontWeight:700,
                color:"white", margin:0 }}>{title}</h3>
              <motion.button whileHover={{scale:1.1,rotate:90}} whileTap={{scale:0.9}}
                onClick={onClose}
                style={{ width:30,height:30,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.2)",
                  background:"rgba(255,255,255,0.08)",color:"white",cursor:"pointer",fontSize:14,
                  display:"flex",alignItems:"center",justifyContent:"center" }}>✕</motion.button>
            </div>
            <div style={{ padding:"24px" }}>{children}</div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Confirm = ({ open, title, sub, onConfirm, onCancel }) => (
  <Modal open={open} onClose={onCancel} title={title} width={400}>
    <p style={{ fontFamily:T.fontBody, fontSize:14, color:T.textSec, marginBottom:24, lineHeight:1.7 }}>{sub}</p>
    <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
      <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      <Btn danger onClick={onConfirm}>Delete</Btn>
    </div>
  </Modal>
);
const openAdd = () => {
    navigate("/products");
};

  const handleDelete = async () => {
    try {
      await api.delete(`/orders/${delTarget}`);
      toast.success("Order deleted");
      setDelTarget(null);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete order");
      setDelTarget(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header + filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.green, margin: 0 }}>
            Your Orders
          </h2>
          <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, background: T.faint,
          borderRadius: 12, padding: 4, border: `1px solid ${T.border}` }}>
          {[["all","All"],["paid","Paid"],["pending","Pending"]].map(([val, label]) => (
            <motion.button key={val} whileTap={{ scale: 0.96 }} onClick={() => setFilter(val)}
              style={{
                padding: "6px 14px", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: T.fontBody, fontSize: 12, fontWeight: 700,
                background: filter === val ? T.green : "transparent",
                color: filter === val ? T.goldLight : T.muted,
                transition: "background 0.18s, color 0.18s",
              }}>
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Table card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: T.surface, borderRadius: 22, border: `1px solid ${T.border}`,
          boxShadow: T.shadow, overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState icon="📭" title="No orders here" sub="Try adjusting the filter above."
          action={{ label:"Add Order", fn:openAdd }}  />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tn-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o, i) => (
                  <motion.tr key={o._id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <td><span style={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em" }}>{shortId(o._id)}</span></td>
                    <td style={{ color: T.muted }}>{fmtDate(o.createdAt)}</td>
                    <td style={{ color: T.muted }}>{o.orderItems?.length || 0} item{(o.orderItems?.length || 0) !== 1 ? "s" : ""}</td>
                    <td><span style={{ fontWeight: 700 }}>{fmt(o.totalPrice)}</span></td>
                    <td><Badge paid={o.isPaid} /></td>
                    <td>
                      <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setDetailId(o._id)}
                        style={{
                          padding: "5px 12px", borderRadius: 8, border: `1px solid ${T.borderMid}`,
                          background: "transparent", cursor: "pointer", fontFamily: T.fontBody,
                          fontSize: 11, fontWeight: 700, color: T.greenMid, letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}>
                        View
                      </motion.button>
                      <Btn size="sm" danger onClick={()=>setDelTarget(o._id)}>Delete</Btn>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailId(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60, backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{
                position: "fixed", inset: 0, zIndex: 70,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "16px",
              }}>
              <div style={{
                background: T.surface, borderRadius: 24, width: "100%", maxWidth: 480,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden",
              }}>
                {/* Modal header */}
                <div style={{
                  padding: "22px 24px 18px",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: `linear-gradient(130deg, ${T.green}, ${T.greenMid})`,
                }}>
                  <div>
                    <p style={{ fontFamily: T.fontAccent, color: T.gold, fontSize: 13,
                      letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>
                      Order Details
                    </p>
                    <h3 style={{ fontFamily: T.fontDisplay, color: "white", fontSize: 20,
                      fontWeight: 700, margin: 0 }}>
                      {shortId(detail._id)}
                    </h3>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDetailId(null)}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer",
                      fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700 }}>
                    ✕
                  </motion.button>
                </div>

                {/* Modal body */}
                <div style={{ padding: "22px 24px" }}>
                  {(() => {
                    const rows = [
                      { label: "Order ID",       value: detail._id },
                      { label: "Date Placed",    value: fmtDate(detail.createdAt) },
                      { label: "Total Amount",   value: fmt(detail.totalPrice) },
                      { label: "Payment Status", value: <Badge paid={detail.isPaid} /> },
                      ...(detail.isPaid && detail.paidAt
                        ? [{ label: "Paid At", value: fmtDate(detail.paidAt) }] : []),
                      { label: "Items",          value: `${detail.orderItems?.length || 0} product(s)` },
                      ...(detail.shippingAddress
                        ? [
                            { label: "Deliver To",  value: detail.shippingAddress.fullName },
                            { label: "Phone",       value: detail.shippingAddress.phone },
                            { label: "Address",     value: `${detail.shippingAddress.address}, ${detail.shippingAddress.city}, ${detail.shippingAddress.state}` },
                          ]
                        : []),
                    ];
                    return rows.map((row, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "11px 0",
                      borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                    }}>
                      <span style={{ fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted }}>
                        {row.label}
                      </span>
                      <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 600, color: T.green }}>
                        {row.value}
                      </span>
                    </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Confirm open={!!delTarget} title="Delete Order"
        sub="This action cannot be undone. The Order will be permanently removed."
        onConfirm={handleDelete} onCancel={()=>setDelTarget(null)} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHIPPING ADDRESS MODAL — collected once before checkout, saved for next time
// ─────────────────────────────────────────────────────────────────────────────
const ShippingModal = ({ open, onClose, initialAddress, onConfirm, submitting }) => {
  const [form, setForm] = useState(initialAddress);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setForm(initialAddress); setError(""); }
  }, [open, initialAddress]);

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={submitting ? undefined : onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80, backdropFilter: "blur(4px)" }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{ position: "fixed", inset: 0, zIndex: 90,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: 24, width: "100%", maxWidth: 420,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})` }}>
                <div>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>
                    Delivery Details
                  </h3>
                  <p style={{ fontFamily: T.fontBody, fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "2px 0 0" }}>
                    Where should we send your order?
                  </p>
                </div>
                {!submitting && (
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>✕</motion.button>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { key: "fullName", placeholder: "Full name", type: "text" },
                  { key: "phone", placeholder: "Phone number", type: "tel" },
                  { key: "address", placeholder: "Street address", type: "text" },
                ].map(f => (
                  <input key={f.key} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} type={f.type}
                    disabled={submitting}
                    style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${T.border}`,
                      background: T.cream, fontFamily: T.fontBody, fontSize: 13, color: T.green, outline: "none",
                      opacity: submitting ? 0.6 : 1 }} />
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input value={form.city} onChange={set("city")} placeholder="City" disabled={submitting}
                    style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${T.border}`,
                      background: T.cream, fontFamily: T.fontBody, fontSize: 13, color: T.green, outline: "none",
                      opacity: submitting ? 0.6 : 1 }} />
                  <input value={form.state} onChange={set("state")} placeholder="State" disabled={submitting}
                    style={{ padding: "11px 14px", borderRadius: 12, border: `1px solid ${T.border}`,
                      background: T.cream, fontFamily: T.fontBody, fontSize: 13, color: T.green, outline: "none",
                      opacity: submitting ? 0.6 : 1 }} />
                </div>

                {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.fontBody, margin: 0 }}>{error}</p>}

                <motion.button type="submit" disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.97 } : {}}
                  style={{
                    width: "100%", marginTop: 4, padding: "13px", borderRadius: 999, border: "none",
                    background: T.green, color: T.goldLight, cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: T.fontBody, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
                    opacity: submitting ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  {submitting && <Spinner size={14} color={T.goldLight} />}
                  {submitting ? "Processing…" : "Continue to Payment"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
const SectionProducts = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null); // product for detail modal
  const [qty, setQty]           = useState(1);
  const [buying, setBuying]     = useState(false);
  const [buyError, setBuyError] = useState("");
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(() => {
    try {
      const stored = localStorage.getItem("tn_shipping_address");
      return stored ? JSON.parse(stored) : { fullName: "", phone: "", address: "", city: "", state: "" };
    } catch {
      return { fullName: "", phone: "", address: "", city: "", state: "" };
    }
  });

  useEffect(() => {
    api.get("/products")
      .then(r => setProducts(r.data?.products || r.data || []))
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openProduct = (p) => {
    setSelected(p);
    setQty(1);
    setBuyError("");
  };
  const closeProduct = () => { if (!buying) setSelected(null); };

  const handleConfirmShipping = (address) => {
    try {
      localStorage.setItem("tn_shipping_address", JSON.stringify(address));
    } catch {
      // non-fatal
    }
    setShippingAddress(address);
    setShippingOpen(false);
    handleBuyNow(selected, address);
  };

  // Same proven flow as the /products page: POST /orders → POST /orders/pay → redirect
  const handleBuyNow = async (product, address) => {
    if (!user?.email) {
      setBuyError("Could not find your email. Please re-login.");
      return;
    }
    setBuying(true);
    setBuyError("");
    try {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.green, margin: 0 }}>
            All Products
          </h2>
          <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, margin: "4px 0 0" }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, opacity: 0.4 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            style={{
              paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
              borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.surface,
              fontFamily: T.fontBody, fontSize: 13, color: T.green, outline: "none",
              boxShadow: T.shadow, width: 200,
            }} />
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}><Spinner size={28} /></div>
      ) : error ? (
        <EmptyState icon="⚠️" title="Error loading products" sub={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🌿" title="No products found" sub="Try a different search term." />
      ) : (
        <div className="tn-prod-grid">
          {filtered.map((p, i) => (
            <motion.div key={p._id || i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.45 }}
              whileHover={{ y: -4, boxShadow: T.shadowMd }}
              style={{
                background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`,
                boxShadow: T.shadow, overflow: "hidden", display: "flex",
                flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s",
              }}>
              {/* Product image */}
              <div style={{ height: 160, background: T.greenPale, position: "relative", overflow: "hidden" }}>
                {p.image ? (
                  <img src={p.image} alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.4 }}>
                    🌿
                  </div>
                )}
                {/* Price badge overlay */}
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
                  borderRadius: 9, padding: "4px 10px",
                  fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.green,
                  border: `1px solid ${T.border}`,
                }}>
                  {fmt(p.price)}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <h4 style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700,
                  color: T.green, margin: 0, lineHeight: 1.3 }}>
                  {p.name}
                </h4>
                {p.category && (
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted,
                    textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {p.category}
                  </span>
                )}
                <div style={{ marginTop: "auto", paddingTop: 10 }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => openProduct(p)}
                    style={{
                      width: "100%", padding: "9px", borderRadius: 10, border: "none",
                      background: T.green, color: T.goldLight, cursor: "pointer",
                      fontFamily: T.fontBody, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                    }}>
                    View Product →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product detail / buy modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeProduct}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60, backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{ position: "fixed", inset: 0, zIndex: 70,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
              <div style={{ background: T.surface, borderRadius: 24, width: "100%", maxWidth: 440,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: `linear-gradient(135deg, ${T.green}, ${T.greenMid})` }}>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>
                    {selected.name}
                  </h3>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={closeProduct}
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer", fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>✕</motion.button>
                </div>

                <div style={{ padding: 24 }}>
                  {selected.image && (
                    <div style={{
                      width: "100%", height: 320, borderRadius: 14, marginBottom: 16,
                      background: T.faint, display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden", padding: 6,
                    }}>
                      <img src={selected.image} alt={selected.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                    </div>
                  )}
                  {selected.description && (
                    <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.textSec, lineHeight: 1.6, marginBottom: 16 }}>
                      {selected.description}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, color: T.green }}>
                      {fmt(selected.price * qty)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={buying}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${T.borderMid}`,
                          background: T.faint, cursor: "pointer", fontWeight: 700 }}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => setQty(q => q + 1)} disabled={buying}
                        style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${T.borderMid}`,
                          background: T.faint, cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>

                  {buyError && (
                    <p style={{ color: T.red, fontSize: 12, marginBottom: 12, fontFamily: T.fontBody }}>{buyError}</p>
                  )}

                  <motion.button whileHover={!buying ? { scale: 1.02 } : {}} whileTap={!buying ? { scale: 0.97 } : {}}
                    disabled={buying}
                    onClick={() => setShippingOpen(true)}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 12, border: "none",
                      background: T.green, color: T.goldLight, cursor: buying ? "not-allowed" : "pointer",
                      fontFamily: T.fontBody, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
                      opacity: buying ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                    {buying && <Spinner size={14} color={T.goldLight} />}
                    {buying ? "Redirecting to payment…" : "Buy Now"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShippingModal
        open={shippingOpen}
        onClose={() => setShippingOpen(false)}
        initialAddress={shippingAddress}
        onConfirm={handleConfirmShipping}
        submitting={buying}
      />
    </div>
  );
};

const SectionHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [active,      setActive]      = useState("dashboard");
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [user,        setUser]        = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [orders,      setOrders]      = useState([]);
  const [ordLoading,  setOrdLoading]  = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("tn_token")) navigate("/login");
  }, [navigate]);

  // ── Verify Paystack payment on redirect back ───────────────────────────
  useEffect(() => {
    const confirmPayment = async () => {
      const reference = searchParams.get("reference");
      if (!reference) return;

      setIsVerifying(true);
      try {
        const response = await api.get(`/orders/verify/${reference}`);
        if (response.data?.success !== false) {
          toast.success("Payment verified successfully! Your order is now marked as paid.");
        } else {
          toast.error("We couldn't confirm this payment. Please contact support if you were charged.");
        }
      } catch (err) {
        console.error("Payment verification failed:", err.message || err);
        toast.error("We couldn't verify your payment. Please contact support if you were charged.");
      } finally {
        setIsVerifying(false);
        setSearchParams(prev => {
          prev.delete("reference");
          return prev;
        }, { replace: true });
      }
    };

    confirmPayment();
  }, [searchParams]);


  // ── Fetch profile ──────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/auth/profile")
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem("tn_token"); navigate("/login"); })
      .finally(() => setUserLoading(false));
  }, [navigate]);

  // ── Fetch orders ───────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/orders/my")
      .then(r => setOrders(Array.isArray(r.data) ? r.data : r.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdLoading(false));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("tn_token");
    localStorage.removeItem("tn_user");
    navigate("/login");
  }, [navigate]);

  const renderSection = () => {
    switch (active) {
      case "home":      return <SectionHome />;
      case "dashboard": return <SectionDashboard user={user} orders={orders} ordersLoading={ordLoading} setActive={setActive} />;
      case "profile":   return <SectionProfile user={user} loading={userLoading} />;
      case "orders":    return <SectionOrders orders={orders} loading={ordLoading} />;
      case "products":  return <SectionProducts user={user} />;
      default:          return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.cream, fontFamily: T.fontBody }}>
      <Sidebar
        active={active} setActive={setActive}
        user={user} onLogout={handleLogout}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          active={active} user={user}
          onLogout={handleLogout}
          onMenuClick={() => setMobileOpen(true)}
        />

        <AnimatePresence>
          {isVerifying && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                margin: "16px 24px 0", padding: "10px 16px", borderRadius: 12,
                background: T.goldPale, border: "1px solid rgba(212,175,55,0.3)",
              }}>
              <Spinner size={16} color={T.gold} />
              <span style={{ fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: "#92600a" }}>
                Securing transaction payment status…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <main style={{ flex: 1, padding: "28px 24px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🌿</span>
            <span style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.green }}>TeeNatural</span>
            <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted }}>Dashboard</span>
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted }}>
            © {new Date().getFullYear()} TeeNatural. All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;