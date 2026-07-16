import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../api/axios";


// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — Dark SaaS theme with TeeNatural gold accent
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  // Dark surfaces
  bg:        "#0d1117",
  surface:   "#161b22",
  surfaceEl: "#1c2128",
  surfaceHov:"#21262d",
  border:    "rgba(255,255,255,0.08)",
  borderHov: "rgba(255,255,255,0.16)",

  // Brand
  green:     "#1a3a2e",
  greenMid:  "#2d5a47",
  greenVib:  "#3d7a60",
  gold:      "#d4af37",
  goldLight: "#f0d060",
  goldPale:  "rgba(212,175,55,0.12)",
  goldBorder:"rgba(212,175,55,0.25)",

  // Text
  textPri:  "#e6edf3",
  textSec:  "#8b949e",
  textMut:  "#484f58",

  // Status
  green_s:  "#238636",
  greenBg:  "rgba(35,134,54,0.12)",
  greenBd:  "rgba(35,134,54,0.3)",
  amber:    "#d29922",
  amberBg:  "rgba(210,153,34,0.12)",
  amberBd:  "rgba(210,153,34,0.3)",
  blue:     "#388bfd",
  blueBg:   "rgba(56,139,253,0.12)",
  blueBd:   "rgba(56,139,253,0.3)",
  red:      "#da3633",
  redBg:    "rgba(218,54,51,0.12)",
  redBd:    "rgba(218,54,51,0.3)",

  // Typography
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",
  fontMono:    "'JetBrains Mono', 'Fira Code', monospace",

  shadow:  "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
  shadowLg:"0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
};



const fmtMoney = n =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const shortId = (id = "") => `#${String(id).slice(-7).toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Spinner = ({ size = 18, color = T.gold }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      border: `2px solid rgba(255,255,255,0.08)`, borderTopColor: color }} />
);

const Badge = ({ label, type = "default" }) => {
  const map = {
    paid:        { bg: T.greenBg, bd: T.greenBd, color: "#4cc26a" },
    pending:     { bg: T.amberBg, bd: T.amberBd, color: T.amber },
    processing:  { bg: T.blueBg,  bd: T.blueBd,  color: T.blue },
    shipped:     { bg: T.goldPale,bd: T.goldBorder,color: T.gold },
    delivered:   { bg: T.greenBg, bd: T.greenBd, color: "#4cc26a" },
    cancelled:   { bg: T.redBg,   bd: T.redBd,   color: T.red },
    admin:       { bg: T.goldPale,bd: T.goldBorder,color: T.gold },
    user:        { bg: "rgba(139,148,158,0.1)", bd: "rgba(139,148,158,0.2)", color: T.textSec },
    default:     { bg: "rgba(139,148,158,0.1)", bd: "rgba(139,148,158,0.2)", color: T.textSec },
  };
  const s = map[label?.toLowerCase()] || map.default;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
      letterSpacing:"0.05em", textTransform:"uppercase",
      background: s.bg, border:`1px solid ${s.bd}`, color: s.color,
      fontFamily: T.fontBody }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background: s.color,
        boxShadow:`0 0 6px ${s.color}` }} />
      {label}
    </span>
  );
};

const EmptyState = ({ icon, title, sub, action }) => (
  <div style={{ textAlign:"center", padding:"60px 24px" }}>
    <div style={{ fontSize:44, marginBottom:14, opacity:0.35 }}>{icon}</div>
    <p style={{ fontFamily:T.fontDisplay, fontSize:18, fontWeight:700, color:T.textPri, marginBottom:6 }}>{title}</p>
    <p style={{ fontFamily:T.fontBody, fontSize:13, color:T.textSec, marginBottom: action ? 20 : 0 }}>{sub}</p>
    {action && (
      <Btn onClick={action.fn} variant="primary">{action.label}</Btn>
    )}
  </div>
);

const Btn = ({ children, onClick, variant="primary", size="md", disabled=false, loading=false, danger=false, type="button" }) => {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    borderRadius:10, border:"none", cursor: disabled||loading?"not-allowed":"pointer",
    fontFamily:T.fontBody, fontWeight:700, letterSpacing:"0.03em",
    transition:"all 0.18s", opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background:`linear-gradient(135deg,${T.green},${T.greenMid})`, color: T.goldLight,
      boxShadow:`0 2px 12px rgba(26,58,46,0.5)` },
    secondary: { background: T.surfaceEl, color: T.textPri,
      border:`1px solid ${T.border}` },
    ghost: { background:"transparent", color:T.textSec, border:`1px solid ${T.border}` },
    danger: { background:"rgba(218,54,51,0.15)", color:T.red, border:`1px solid ${T.redBd}` },
    gold: { background:`linear-gradient(135deg,${T.gold},${T.goldLight})`, color:T.green },
  };
  const sizes = { sm:{padding:"5px 12px",fontSize:12}, md:{padding:"8px 18px",fontSize:13}, lg:{padding:"11px 24px",fontSize:14} };
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled||loading}
      whileHover={!disabled&&!loading?{ scale:1.02, opacity:0.92 }:{}}
      whileTap={!disabled&&!loading?{ scale:0.97 }:{}}
      style={{ ...base, ...variants[danger?"danger":variant], ...sizes[size] }}>
      {loading && <Spinner size={13} color={variant==="primary"?T.goldLight:T.textSec} />}
      {children}
    </motion.button>
  );
};




const Input = ({ label, value, onChange, type="text", placeholder="", required=false, min, step }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontFamily:T.fontBody, fontSize:12, fontWeight:700,
      color:T.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}{required&&" *"}</label>}
    <input type={type} value={value} min={min} step={step} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} required={required}
      style={{ padding:"9px 13px", borderRadius:10, border:`1px solid ${T.border}`,
        background:T.bg, color:T.textPri, fontFamily:T.fontBody, fontSize:14,
        outline:"none", transition:"border 0.18s",
        "--focus-border":`1px solid ${T.gold}` }}
      onFocus={e=>e.target.style.border=`1px solid ${T.gold}`}
      onBlur={e=>e.target.style.border=`1px solid ${T.border}`}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontFamily:T.fontBody, fontSize:12, fontWeight:700,
      color:T.textSec, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ padding:"9px 13px", borderRadius:10, border:`1px solid ${T.border}`,
        background:T.bg, color:T.textPri, fontFamily:T.fontBody, fontSize:13, outline:"none" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

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

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return ()=>clearTimeout(t); }, [onClose]);
  const colors = { success:T.green_s, error:T.red, info:T.blue };
  return (
    <motion.div initial={{opacity:0,y:20,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
      exit={{opacity:0,y:20,scale:0.95}}
      style={{ padding:"12px 18px", borderRadius:12, background:T.surfaceEl,
        border:`1px solid ${colors[type]||T.border}`, boxShadow:T.shadowLg,
        fontFamily:T.fontBody, fontSize:13, color:T.textPri, display:"flex",
        alignItems:"center", gap:10, maxWidth:360, marginBottom:8 }}>
      <span style={{fontSize:16}}>{type==="success"?"✅":type==="error"?"❌":"ℹ️"}</span>
      {msg}
    </motion.div>
  );
};

// Confirm dialog
const Confirm = ({ open, title, sub, onConfirm, onCancel }) => (
  <Modal open={open} onClose={onCancel} title={title} width={400}>
    <p style={{ fontFamily:T.fontBody, fontSize:14, color:T.textSec, marginBottom:24, lineHeight:1.7 }}>{sub}</p>
    <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
      <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      <Btn danger onClick={onConfirm}>Delete</Btn>
    </div>
  </Modal>
);

// ─────────────────────────────────────────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",  icon:"🏠",  label:"Home"  },
  { id:"overview",  icon:"◈",  label:"Overview"  },
  { id:"products",  icon:"🌿", label:"Products"  },
  { id:"orders",    icon:"📦", label:"Orders"    },
  { id:"users",     icon:"👥", label:"Users"     },
  { id:"settings",  icon:"⚙️", label:"Settings"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, profile, onLogout, mobileOpen, setMobileOpen }) => {
  const content = (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"24px 0" }}>
      {/* Logo */}
      <div style={{ padding:"0 20px 24px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:10, flexShrink:0,
            background:`linear-gradient(135deg,${T.gold},${T.goldLight})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:17, boxShadow:`0 4px 12px rgba(212,175,55,0.4)` }}>🌿</div>
          <div>
            <div style={{ fontFamily:T.fontDisplay, fontSize:15, fontWeight:700, color:T.textPri }}>TeeNatural</div>
            <div style={{ fontFamily:T.fontBody, fontSize:10, color:T.gold, letterSpacing:"0.1em", textTransform:"uppercase" }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:"18px 10px", display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontFamily:T.fontBody, fontSize:10, fontWeight:700, letterSpacing:"0.1em",
          textTransform:"uppercase", color:T.textMut, padding:"0 10px", marginBottom:8 }}>Menu</div>
        {NAV.map(item => {
          const on = active === item.id;
          return (
            <motion.button key={item.id} whileHover={{ x:2 }} whileTap={{ scale:0.98 }}
              onClick={()=>{ setActive(item.id); setMobileOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 13px",
                borderRadius:11, cursor:"pointer", textAlign:"left", width:"100%",
                background: on ? T.goldPale : "transparent",
                border: on ? `1px solid ${T.goldBorder}` : "1px solid transparent",
                color: on ? T.goldLight : T.textSec,
                fontFamily:T.fontBody, fontSize:13, fontWeight: on ? 700 : 500,
                transition:"all 0.18s" }}>
              <span style={{ fontSize:15, width:20, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {on && <motion.div layoutId="sidebar-pip"
                style={{ width:5,height:5,borderRadius:"50%",background:T.gold,
                  boxShadow:`0 0 8px ${T.gold}` }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* Profile mini */}
      {profile && (
        <div style={{ padding:"0 10px" }}>
          <div style={{ background:T.surfaceEl, borderRadius:14, padding:"12px 13px",
            border:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0,
                background:`linear-gradient(135deg,${T.green},${T.greenMid})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:T.goldLight, fontFamily:T.fontDisplay, fontSize:13, fontWeight:700 }}>
                {profile.name?.[0]?.toUpperCase()||"A"}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:T.fontBody, fontSize:12, fontWeight:700, color:T.textPri,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.name}</div>
                <div style={{ fontFamily:T.fontBody, fontSize:10, color:T.gold, letterSpacing:"0.05em",
                  textTransform:"uppercase" }}>{profile.role}</div>
              </div>
            </div>
            <Btn size="sm" danger onClick={onLogout} style={{ width:"100%" }}>Sign out</Btn>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside style={{ width:220, flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`,
        height:"100vh", position:"sticky", top:0, overflowY:"auto", display:"none" }}
        className="tn-admin-sidebar">{content}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={()=>setMobileOpen(false)}
              style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:40,backdropFilter:"blur(3px)" }} />
            <motion.aside initial={{x:-240}} animate={{x:0}} exit={{x:-240}}
              transition={{type:"spring",stiffness:300,damping:28}}
              style={{ position:"fixed",top:0,left:0,width:240,height:"100vh",
                background:T.surface,zIndex:50,overflowY:"auto",
                boxShadow:"4px 0 40px rgba(0,0,0,0.5)" }}>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media(min-width:1024px){ .tn-admin-sidebar{display:block!important;} .tn-admin-hamburger{display:none!important;} .tn-topbar-name{display:block!important;} }
        *{box-sizing:border-box;} body{margin:0;background:${T.bg};}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}
        .tn-tbl{width:100%;border-collapse:collapse;}
        .tn-tbl th{padding:10px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${T.textMut};background:rgba(255,255,255,0.02);border-bottom:1px solid ${T.border};text-align:left;}
        .tn-tbl td{padding:13px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:${T.textPri};border-bottom:1px solid ${T.border};}
        .tn-tbl tr:last-child td{border-bottom:none;}
        .tn-tbl tr{transition:background 0.15s;}
        .tn-tbl tr:hover td{background:rgba(255,255,255,0.02);}
        .tn-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
        @media(max-width:900px){.tn-stat-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:480px){.tn-stat-grid{grid-template-columns:1fr;}}
        .tn-topbar-name{display:none;}
        .tn-admin-hamburger{}
        input,select,textarea{box-sizing:border-box;}
      `}</style>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
const Topbar = ({ active, profile, onLogout, onMenu }) => {
  const title = NAV.find(n=>n.id===active)?.label || "Dashboard";
  return (
    <header style={{ height:60, background:T.surface, borderBottom:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 22px", position:"sticky", top:0, zIndex:30 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onMenu} className="tn-admin-hamburger"
          style={{ background:"none",border:"none",cursor:"pointer",padding:6,
            display:"flex",flexDirection:"column",gap:4.5 }}>
          {[0,1,2].map(i=><span key={i} style={{ width:19,height:1.5,background:T.textPri,borderRadius:2,display:"block" }} />)}
        </button>
        <h1 style={{ fontFamily:T.fontDisplay, fontSize:19, fontWeight:700,
          color:T.textPri, margin:0 }}>{title}</h1>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div className="tn-topbar-name" style={{ textAlign:"right" }}>
          <div style={{ fontFamily:T.fontBody, fontSize:12, fontWeight:700, color:T.textPri }}>{profile?.name}</div>
          <div style={{ fontFamily:T.fontBody, fontSize:10, color:T.gold, textTransform:"uppercase", letterSpacing:"0.06em" }}>Administrator</div>
        </div>
        <div style={{ width:34,height:34,borderRadius:"50%",
          background:`linear-gradient(135deg,${T.gold},${T.goldLight})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:T.fontDisplay, fontSize:14, fontWeight:700, color:T.green,
          boxShadow:`0 2px 8px rgba(212,175,55,0.4)` }}>
          {profile?.name?.[0]?.toUpperCase()||"A"}
        </div>
        {/* <Btn size="sm" danger onClick={onLogout}>Logout</Btn> */}
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent, delay=0 }) => (
  <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
    transition={{delay,duration:0.5,ease:[0.22,1,0.36,1]}}
    whileHover={{y:-3,boxShadow:T.shadowLg}}
    style={{ background:T.surface, borderRadius:18, padding:"20px 22px",
      border:`1px solid ${T.border}`, boxShadow:T.shadow, transition:"box-shadow 0.2s",
      position:"relative", overflow:"hidden" }}>
    {/* Glow accent */}
    <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80,
      borderRadius:"50%", background: accent||T.goldPale, filter:"blur(20px)", opacity:0.6 }} />
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, position:"relative" }}>
      <span style={{ fontFamily:T.fontBody, fontSize:11, fontWeight:700, letterSpacing:"0.08em",
        textTransform:"uppercase", color:T.textSec }}>{label}</span>
      <div style={{ width:36,height:36,borderRadius:10,
        background: accent ? `${accent}22` : T.goldPale,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>{icon}</div>
    </div>
    <div style={{ fontFamily:T.fontDisplay, fontSize:30, fontWeight:700, color:T.textPri,
      lineHeight:1, position:"relative" }}>{value}</div>
    {sub && <div style={{ fontFamily:T.fontBody, fontSize:12, color:T.textSec, marginTop:6 }}>{sub}</div>}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const SectionOverview = ({ stats, orders, setActive }) => {
  const ordersCount = stats.orders;
  const recent = [...(orders||[])].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* Stats */}
      <div className="tn-stat-grid">
        <StatCard icon="👥" label="Total Users"    value={stats.users}    sub="Registered accounts" delay={0.04} accent="rgba(56,139,253,0.15)" />
        <StatCard icon="📦" label="Total Orders"   value={stats.orders}   sub="All time"            delay={0.1}  accent="rgba(212,175,55,0.15)" />
        <StatCard icon="💰" label="Total Revenue"  value={fmtMoney(stats.revenue)} sub="From paid orders" delay={0.16} accent="rgba(35,134,54,0.15)" />
        <StatCard icon="🌿" label="Products"       value={stats.products} sub="In catalogue"        delay={0.22} accent="rgba(61,122,96,0.2)" />
      </div>

      {/* Recent orders table */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
        style={{ background:T.surface, borderRadius:18, border:`1px solid ${T.border}`,
          boxShadow:T.shadow, overflow:"hidden" }}>
        <div style={{ padding:"18px 22px 14px", display:"flex", alignItems:"center",
          justifyContent:"space-between", borderBottom:`1px solid ${T.border}` }}>
          <h3 style={{ fontFamily:T.fontDisplay, fontSize:16, fontWeight:700, color:T.textPri, margin:0 }}>
            Recent Orders
          </h3>
          <Btn size="sm" variant="ghost" onClick={()=>setActive("orders")}>View all →</Btn>
        </div>
        {!recent.length ? (
          <EmptyState icon="📭" title="No orders yet" sub="Orders will appear here." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="tn-tbl">
              <thead><tr>
                <th>Order ID</th><th>Customer</th><th>Total</th>
                <th>Payment</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recent.map(o=>(
                  <tr key={o._id}>
                    <td><span style={{ fontFamily:T.fontMono, fontSize:12, color:T.gold }}>{shortId(o._id)}</span></td>
                    <td style={{ color:T.textSec }}>{o.user?.email||o.shippingAddress?.email||"—"}</td>
                    <td><span style={{ fontWeight:700 }}>{fmtMoney(o.totalPrice)}</span></td>
                    <td><Badge label={o.isPaid?"Paid":"Pending"} /></td>
                    <td><Badge label={o.status||o.orderStatus||"Processing"} /></td>
                    <td style={{ color:T.textSec }}>{fmtDate(o.createdAt)}</td>
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
// SECTION: PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  { value:"SKINCARE",    label:"Skincare"    },
  { value:"HAIRCARE",    label:"Haircare"    },
  { value:"BABYCARE",    label:"Babycare"    },
  { value:"ACCESSORIES", label:"Accessories" },
];

const PRODUCT_DEFAULTS = { name:"", price:"", category:"SKINCARE", countInStock:"", description:"", image:"" };

const SectionProducts = ({ toast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(PRODUCT_DEFAULTS);
  const [editId, setEditId]     = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };
  fetchUser();
}, []);

const uploadAvatar = async (file) => {
   
  if (!file) {
    toast.error("No image selected");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    // 1️⃣ Upload to Cloudinary
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    const imageUrl = res.data.secure_url;
    console.log("Image URL:", imageUrl);
    setForm((prev) => ({
  ...prev,
  image: imageUrl,
}));
    // toast.success("Image uploaded successfully 🖼️");

    // toast.success("Profile picture updated!");
    return imageUrl;

  } catch (err) {
    console.error("Upload error:", err);
    // toast.error("Image upload failed 😢");
    return null;
  }
};
useEffect(() => {
  console.log("form.image:", form.image);
}, [form.image]);

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
console.log("Selected file:", file);
  const imageUrl = await uploadAvatar(file);
   console.log("Cloudinary URL:", imageUrl);

  if (imageUrl) {
    setForm((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  }
};
  const load = useCallback(()=>{
    setLoading(true);
    api.get("/products")
      .then(r=>setProducts(r.data?.products||r.data||[]))
      .catch(()=>toast("Failed to load products","error"))
      .finally(()=>setLoading(false));
  },[toast]);

  useEffect(()=>{ load(); },[load]);

  const openAdd = () => { setForm(PRODUCT_DEFAULTS); setEditId(null); setModal(true); };
  const openEdit = p => {
    setForm({ name:p.name||"", price:p.price||"", category:p.category||"SKINCARE",
      countInStock:p.countInStock||"", description:p.description||"", image:p.image||"" });
    setEditId(p._id); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name||!form.price) return toast("Name and price are required","error");
    setSaving(true);
    try {
      const payload = { ...form, price:Number(form.price), countInStock:Number(form.countInStock)||0, category:form.category||"SKINCARE"};
      if (editId) await api.put(`/products/${editId}`, payload);
      else        await api.post("/products", payload);
      toast(editId?"Product updated":"Product created","success");
      setModal(false); load();
    } catch(e) {
      toast(e.response?.data?.message||"Save failed","error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${delTarget}`);
      toast("Product deleted","success");
      setDelTarget(null); load();
    } catch { toast("Delete failed","error"); }
  };

  const filtered = products.filter(p=>p.name?.toLowerCase().includes(search.toLowerCase()));

  
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Toolbar */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:T.fontDisplay, fontSize:20, fontWeight:700, color:T.textPri, margin:0 }}>Products</h2>
          <p style={{ fontFamily:T.fontBody, fontSize:12, color:T.textSec, margin:"3px 0 0" }}>{filtered.length} products</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:0.4 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              style={{ paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,
                borderRadius:10,border:`1px solid ${T.border}`,background:T.surfaceEl,
                color:T.textPri,fontFamily:T.fontBody,fontSize:13,outline:"none",width:190 }}
              onFocus={e=>e.target.style.border=`1px solid ${T.gold}`}
              onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
          </div>
          <Btn onClick={openAdd} variant="gold" size="md">+ Add Product</Btn>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        style={{ background:T.surface, borderRadius:18, border:`1px solid ${T.border}`,
          boxShadow:T.shadow, overflow:"hidden" }}>
        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={28} /></div>
        ) : filtered.length===0 ? (
          <EmptyState icon="🌿" title="No products found" sub="Add your first product to get started."
            action={{ label:"Add Product", fn:openAdd }} />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="tn-tbl">
              <thead><tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th style={{textAlign:"right"}}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((p,i)=>(
                  <motion.tr key={p._id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.03}}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                        <div style={{ width:38,height:38,borderRadius:10,overflow:"hidden",flexShrink:0,
                          background:"rgba(61,122,96,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          {p.image ? <img src={p.image} alt={p.name}
                            style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                            : <span style={{ fontSize:18,opacity:0.4 }}>🌿</span>}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, color:T.textPri }}>{p.name}</div>
                          {p.description && <div style={{ fontSize:11,color:T.textSec,
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220 }}>
                            {p.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:T.fontBody,fontSize:12,color:T.textSec,
                      background:T.surfaceEl,padding:"3px 9px",borderRadius:6,border:`1px solid ${T.border}` }}>
                      {p.category||"—"}</span></td>
                    <td><span style={{ fontWeight:700,color:T.gold }}>{fmtMoney(p.price)}</span></td>
                    <td>
                      <span style={{ fontFamily:T.fontBody,fontSize:13,
                        color:(p.countInStock||0)<5?T.red:(p.countInStock||0)<20?T.amber:"#4cc26a" }}>
                        {p.countInStock??0} units</span>
                    </td>
                    <td>
                      <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                        <Btn size="sm" variant="secondary" onClick={()=>openEdit(p)}>Edit</Btn>
                        <Btn size="sm" danger onClick={()=>setDelTarget(p._id)}>Delete</Btn>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?"Edit Product":"Add New Product"} width={560}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Product Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required />
            <Input label="Price (₦)" type="number" value={form.price} min="0" step="0.01"
              onChange={v=>setForm(f=>({...f,price:v}))} required />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Select label="Category" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}
              options={PRODUCT_CATEGORIES} />
            <Input label="Stock Qty" type="number" min="0" value={form.countInStock}
              onChange={v=>setForm(f=>({...f,countInStock:v}))} />
          </div>
          {/* <Input label="Upload Image" value={form.image} onChange={v=>setForm(f=>({...f,image:v}))} placeholder="https://…" /> */}
          <input
              ref={fileInputRef}
              label="Upload Image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                padding: "9px 13px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.bg,
                color: T.textPri,
                fontFamily: T.fontBody,
                fontSize: 14,
                outline: "none",
              }}
            />
            {form.image && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <img
                  src={form.image}
                  alt="Product Preview"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                  }}
                />
              </div>
            )}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontFamily:T.fontBody,fontSize:12,fontWeight:700,
              color:T.textSec,letterSpacing:"0.06em",textTransform:"uppercase" }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              rows={3} placeholder="Product description…"
              style={{ padding:"9px 13px",borderRadius:10,border:`1px solid ${T.border}`,
                background:T.bg,color:T.textPri,fontFamily:T.fontBody,fontSize:13,
                outline:"none",resize:"vertical" }}
              onFocus={e=>e.target.style.border=`1px solid ${T.gold}`}
              onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
          </div>
          <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:4 }}>
            <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn variant="gold" onClick={handleSave} loading={saving}>{editId?"Save Changes":"Create Product"}</Btn>
          </div>
        </div>
      </Modal>

      <Confirm open={!!delTarget} title="Delete Product"
        sub="This action cannot be undone. The product will be permanently removed."
        onConfirm={handleDelete} onCancel={()=>setDelTarget(null)} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: ORDERS
// ─────────────────────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value:"Processing", label:"Processing" },
  { value:"Shipped",    label:"Shipped"    },
  { value:"Delivered",  label:"Delivered"  },
  { value:"Cancelled",  label:"Cancelled"  },
];

const SectionOrders = ({ toast }) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [saving,  setSaving]  = useState({});

  useEffect(() => {
  api.get("/admin/orders")
    .then((r) => {
      console.log("Orders Response:", r.data);
      setOrders(
        Array.isArray(r.data)
          ? r.data
          : r.data?.orders || []
      );
    })
    .catch((err) => {
      console.log("Orders Error:", err);
    });
}, []);

  const load = useCallback(()=>{
    setLoading(true);
    api.get("/admin/orders")
      .then(r=>setOrders(Array.isArray(r.data)?r.data:r.data?.orders||[]))
      .catch(()=>toast("Failed to load orders","error"))
      .finally(()=>setLoading(false));
  },[toast]);

  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id, payload, label) => {
    setSaving(s=>({...s,[id]:true}));
    try {
      await api.put(`/admin/orders/${id}`, payload);
      toast(`Order ${label}`,"success");
      load();
    } catch { toast("Update failed","error"); }
    finally { setSaving(s=>({...s,[id]:false})); }
  };

  const filtered = orders
    .filter(o=> filter==="all" ? true : filter==="paid" ? o.isPaid : !o.isPaid)
    .filter(o=> !search || o._id?.toLowerCase().includes(search.toLowerCase())
      || o.user?.email?.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ fontFamily:T.fontDisplay,fontSize:20,fontWeight:700,color:T.textPri,margin:0 }}>Orders</h2>
          <p style={{ fontFamily:T.fontBody,fontSize:12,color:T.textSec,margin:"3px 0 0" }}>{sorted.length} orders</p>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:0.4 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order/email…"
              style={{ paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,
                borderRadius:10,border:`1px solid ${T.border}`,background:T.surfaceEl,
                color:T.textPri,fontFamily:T.fontBody,fontSize:13,outline:"none",width:210 }}
              onFocus={e=>e.target.style.border=`1px solid ${T.gold}`}
              onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
          </div>
          <div style={{ display:"flex",gap:5,background:T.surfaceEl,
            borderRadius:11,padding:4,border:`1px solid ${T.border}` }}>
            {[["all","All"],["paid","Paid"],["pending","Pending"]].map(([v,l])=>(
              <motion.button key={v} whileTap={{scale:0.96}} onClick={()=>setFilter(v)}
                style={{ padding:"5px 13px",borderRadius:8,cursor:"pointer",
                  fontFamily:T.fontBody,fontSize:12,fontWeight:700,
                  background:filter===v?T.goldPale:"transparent",
                  color:filter===v?T.goldLight:T.textSec,
                  border:filter===v?`1px solid ${T.goldBorder}`:"1px solid transparent",
                  transition:"all 0.18s" }}>{l}</motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        style={{ background:T.surface,borderRadius:18,border:`1px solid ${T.border}`,
          boxShadow:T.shadow,overflow:"hidden" }}>
        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={28} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState icon="📭" title="No orders found" sub="Orders will appear here once customers purchase." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="tn-tbl">
              <thead><tr>
                <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th>
                <th>Payment</th><th>Order Status</th><th>Date</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {sorted.map((o,i)=>(
                  <motion.tr key={o._id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.025}}>
                    <td><span style={{ fontFamily:T.fontMono,fontSize:12,color:T.gold }}>{shortId(o._id)}</span></td>
                    <td style={{ color:T.textSec,fontSize:12 }}>{o.user?.email||o.shippingAddress?.email||"—"}</td>
                    <td style={{ color:T.textSec }}>{o.orderItems?.length||0}</td>
                    <td><span style={{ fontWeight:700 }}>{fmtMoney(o.totalPrice)}</span></td>
                    <td><Badge label={o.isPaid?"Paid":"pending"} /></td>
                    <td>
                      <select value={o.status||o.orderStatus||"Processing"}
                        onChange={e=>updateStatus(o._id,{status:e.target.value,orderStatus:e.target.value},"status updated")}
                        disabled={saving[o._id]}
                        style={{ padding:"5px 10px",borderRadius:8,border:`1px solid ${T.border}`,
                          background:T.surfaceEl,color:T.textPri,fontFamily:T.fontBody,fontSize:12,outline:"none" }}>
                        {ORDER_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td style={{ color:T.textSec,fontSize:12 }}>{fmtDate(o.createdAt)}</td>
                    <td>
                      {!o.isDelivered && (
                        <Btn size="sm" variant="secondary" loading={saving[o._id]}
                          onClick={()=>updateStatus(o._id,{isDelivered:true,deliveredAt:new Date().toISOString(),status:"Delivered",orderStatus:"Delivered"},"marked delivered")}>
                          ✓ Deliver
                        </Btn>
                      )}
                      {o.isDelivered && <span style={{ fontSize:12,color:"#4cc26a" }}>✓ Delivered</span>}
                    </td>
                  </motion.tr>
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
// SECTION: USERS
// ─────────────────────────────────────────────────────────────────────────────
const SectionUsers = ({ toast }) => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(()=>{
    api.get("/admin/users")
      .then(r=>setUsers(Array.isArray(r.data)?r.data:r.data?.users||[]))
      .catch(()=>toast("Failed to load users","error"))
      .finally(()=>setLoading(false));
  },[toast]);

  const filtered = users
    .filter(u=> filter==="all" ? true : u.role===filter)
    .filter(u=> !search
      || u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ fontFamily:T.fontDisplay,fontSize:20,fontWeight:700,color:T.textPri,margin:0 }}>Users</h2>
          <p style={{ fontFamily:T.fontBody,fontSize:12,color:T.textSec,margin:"3px 0 0" }}>{filtered.length} accounts</p>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:0.4 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name/email…"
              style={{ paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,
                borderRadius:10,border:`1px solid ${T.border}`,background:T.surfaceEl,
                color:T.textPri,fontFamily:T.fontBody,fontSize:13,outline:"none",width:200 }}
              onFocus={e=>e.target.style.border=`1px solid ${T.gold}`}
              onBlur={e=>e.target.style.border=`1px solid ${T.border}`} />
          </div>
          <div style={{ display:"flex",gap:5,background:T.surfaceEl,
            borderRadius:11,padding:4,border:`1px solid ${T.border}` }}>
            {[["all","All"],["admin","Admins"],["user","Users"]].map(([v,l])=>(
              <motion.button key={v} whileTap={{scale:0.96}} onClick={()=>setFilter(v)}
                style={{ padding:"5px 13px",borderRadius:8,cursor:"pointer",
                  fontFamily:T.fontBody,fontSize:12,fontWeight:700,
                  background:filter===v?T.goldPale:"transparent",
                  color:filter===v?T.goldLight:T.textSec,
                  border:filter===v?`1px solid ${T.goldBorder}`:"1px solid transparent",
                  transition:"all 0.18s" }}>{l}</motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        style={{ background:T.surface,borderRadius:18,border:`1px solid ${T.border}`,
          boxShadow:T.shadow,overflow:"hidden" }}>
        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner size={28} /></div>
        ) : filtered.length===0 ? (
          <EmptyState icon="👥" title="No users found" sub="No users match your search." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table className="tn-tbl">
              <thead><tr>
                <th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>ID</th>
              </tr></thead>
              <tbody>
                {filtered.map((u,i)=>(
                  <motion.tr key={u._id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.025}}>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,
                          background: u.role==="admin"
                            ? `linear-gradient(135deg,${T.gold},${T.goldLight})`
                            : `linear-gradient(135deg,${T.green},${T.greenMid})`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontFamily:T.fontDisplay,fontSize:13,fontWeight:700,
                          color: u.role==="admin"?T.green:T.goldLight }}>
                          {u.name?.[0]?.toUpperCase()||"?"}
                        </div>
                        <span style={{ fontWeight:700 }}>{u.name||"Unknown"}</span>
                      </div>
                    </td>
                    <td style={{ color:T.textSec,fontSize:12 }}>{u.email}</td>
                    <td><Badge label={u.role||"user"} /></td>
                    <td style={{ color:T.textSec,fontSize:12 }}>{fmtDate(u.createdAt)}</td>
                    <td><span style={{ fontFamily:T.fontMono,fontSize:11,color:T.textMut }}>{shortId(u._id)}</span></td>
                  </motion.tr>
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
// SECTION: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
const SectionSettings = ({ profile }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:18,maxWidth:560 }}>
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
      <h2 style={{ fontFamily:T.fontDisplay,fontSize:20,fontWeight:700,color:T.textPri,margin:"0 0 4px" }}>Settings</h2>
      <p style={{ fontFamily:T.fontBody,fontSize:12,color:T.textSec,margin:0 }}>Admin account information</p>
    </motion.div>

    {/* Profile card */}
    <motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="overflow-hidden rounded-[20px] border shadow-lg"
  style={{
    background: T.surface,
    borderColor: T.border,
    boxShadow: T.shadow,
  }}
>
  {/* Header */}
  <div
    className="relative h-[72px] overflow-hidden"
    style={{
      background: `linear-gradient(130deg, ${T.green}, ${T.greenMid})`,
    }}
  >
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage:
          "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />

    <div
      className="absolute -top-5 -right-5 h-[120px] w-[120px] rounded-full"
      style={{
        background: "rgba(212,175,55,0.12)",
        filter: "blur(20px)",
      }}
    />
  </div>

  {/* Content */}
  <div className="px-6 pb-6">
    <div className="-mt-7 mb-[18px] flex items-end gap-3.5">
      <div
        className="flex h-14 w-14 z-10 shrink-0 items-center justify-center rounded-full border-[3px] text-[20px] font-bold"
        style={{
          background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`,
          color: T.green,
          fontFamily: T.fontDisplay,
          borderColor: "#161b22",
          boxShadow: "0 4px 16px rgba(212,175,55,0.4)",
        }}
      >
        {profile?.name?.[0]?.toUpperCase() || "A"}
      </div>

      <Badge label={profile?.role || "admin"} />
    </div>

    <h3
      className="mb-[3px] text-[20px] font-bold"
      style={{
        color: T.textPri,
        fontFamily: T.fontDisplay,
      }}
    >
      {profile?.name}
    </h3>

    <p
      className="text-[13px]"
      style={{
        color: T.textSec,
        fontFamily: T.fontBody,
      }}
    >
      {profile?.email}
    </p>
  </div>
</motion.div>

    {/* Info rows */}
    {[
      { label:"Full Name", value:profile?.name, icon:"✦" },
      { label:"Email",     value:profile?.email, icon:"◎" },
      { label:"Account ID",value:shortId(profile?._id), icon:"⬡" },
      { label:"Role",      value:"Administrator", icon:"★" },
      { label:"API Base",  value:"http://localhost:3000/api", icon:"🔌" },
    ].map((r,i)=>(
      <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
        transition={{delay:0.15+i*0.06}}
        style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,
          boxShadow:T.shadow,padding:"14px 18px",display:"flex",alignItems:"center",gap:13 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:T.goldPale,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:T.gold,fontSize:14,fontWeight:700 }}>{r.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:T.fontBody,fontSize:11,fontWeight:700,textTransform:"uppercase",
            letterSpacing:"0.07em",color:T.textMut,marginBottom:2 }}>{r.label}</div>
          <div style={{ fontFamily:T.fontBody,fontSize:14,fontWeight:600,color:T.textPri }}>{r.value||"—"}</div>
        </div>
      </motion.div>
    ))}

    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.55}}
      style={{ background:T.surfaceEl,borderRadius:14,border:`1px solid ${T.goldBorder}`,
        padding:"14px 18px",display:"flex",alignItems:"center",gap:10 }}>
      <span style={{ fontSize:18 }}>🌿</span>
      <div>
        <div style={{ fontFamily:T.fontBody,fontSize:12,fontWeight:700,color:T.gold,marginBottom:2 }}>TeeNatural Admin v1.0</div>
        <div style={{ fontFamily:T.fontBody,fontSize:12,color:T.textSec }}>Production-ready admin panel. All CRUD operations active.</div>
      </div>
    </motion.div>
  </div>
);

const SectionHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/")
  }, [navigate])

};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT: ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [active,      setActive]      = useState("overview");
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profile,     setProfile]     = useState(null);
  const [orders,      setOrders]      = useState([]);
  const [products,    setProducts]    = useState([]);
  const [users,       setUsers]       = useState([]);
  const [toasts,      setToasts]      = useState([]);

  const toast = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
  },[]);

  const removeToast = useCallback(id => {
    setToasts(t=>t.filter(x=>x.id!==id));
  },[]);

  // Auth guard
  useEffect(() => {
  const token = localStorage.getItem("tn_token");

  if (!token) {
    navigate("/login");
  }
}, [navigate]);

  // Fetch profile
  useEffect(()=>{
    api.get("/auth/profile")
      .then(r=>setProfile(r.data))
      .catch(()=>{ localStorage.removeItem("tn_token"); navigate("/login"); });
  },[navigate]);

  // Fetch overview data
  useEffect(()=>{
    api.get("/orders/my").then(r=>setOrders(Array.isArray(r.data)?r.data:r.data?.orders||[])).catch(()=>{});
    api.get("/products").then(r=>setProducts(r.data?.products||r.data||[])).catch(()=>{});
    api.get("/admin/users").then(r=>setUsers(Array.isArray(r.data)?r.data:r.data?.users||[])).catch(()=>{});
  },[]);

  const handleLogout = useCallback(()=>{
    localStorage.removeItem("tn_token");
    localStorage.removeItem("tn_user");
    navigate("/login");
  },[navigate]);

  const revenue = orders.filter(o=>o.isPaid).reduce((s,o)=>s+(o.totalPrice||0),0);
  const stats = { users:users.length, orders:orders.length, revenue, products:products.length };

  const renderSection = () => {
    switch(active){
      case "home":      return <SectionHome />;
      case "overview":  return <SectionOverview stats={stats} orders={orders} setActive={setActive} />;
      case "products":  return <SectionProducts toast={toast} />;
      case "orders":    return <SectionOrders toast={toast} />;
      case "users":     return <SectionUsers toast={toast} />;
      case "settings":  return <SectionSettings profile={profile} />;
      default:          return null;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:T.fontBody }}>
      <Sidebar active={active} setActive={setActive} profile={profile}
        onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <Topbar active={active} profile={profile} onLogout={handleLogout}
          onMenu={()=>setMobileOpen(true)} />

        <main style={{ flex:1, padding:"24px 22px", maxWidth:1200, width:"100%", margin:"0 auto", alignSelf:"stretch" }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              transition={{duration:0.28,ease:[0.22,1,0.36,1]}}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer style={{ padding:"14px 22px", borderTop:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13 }}>🌿</span>
            <span style={{ fontFamily:T.fontDisplay, fontSize:13, fontWeight:700, color:T.textPri }}>TeeNatural</span>
            <span style={{ fontFamily:T.fontBody, fontSize:11, color:T.textMut }}>Admin Dashboard</span>
          </div>
          <span style={{ fontFamily:T.fontBody, fontSize:11, color:T.textMut }}>
            © {new Date().getFullYear()} TeeNatural. All rights reserved.
          </span>
        </footer>
      </div>

      {/* Toast container */}
      <div style={{ position:"fixed", bottom:20, right:20, zIndex:100,
        display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
        <AnimatePresence>
          {toasts.map(t=>(
            <Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;