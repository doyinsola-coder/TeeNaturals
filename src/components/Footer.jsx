import React from 'react'
import { motion } from 'framer-motion'
import { FaLeaf, FaSpa, FaFacebook, FaInstagram, FaTiktok, FaArrowRight, FaHeart } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const TOKEN = {
  green: "#1a3a2e", greenMid: "#2d5a47", gold: "#d4af37", goldLight: "#f0d060",
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontAccent: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'Plus Jakarta Sans', sans-serif",
};

const socialLinks = [
  { icon: FaFacebook, label: 'Facebook',  url: 'https://www.facebook.com/share/1ANusU1xvj/', hoverColor: '#1877F2' },
  { icon: FaInstagram, label: 'Instagram', url: 'https://instagram.com',                      hoverColor: '#E4405F' },
  { icon: FaTiktok,   label: 'TikTok',    url: 'https://www.tiktok.com/@teenaturals4?_r=1&_t=ZS-91SMH6V0VPQ', hoverColor: '#ffffff' },
];

const quickLinks = [
  { name: 'About Us',      href: '/about' },
  { name: 'Our Products',  href: '/products' },
  { name: 'Sustainability',href: '/sustainability' },
  { name: 'Consultation',  href: '/consultation' },
  { name: 'Spa Bookings',  href: '/spa-bookings' },
];

const shopLinks = [
  { name: 'Skincare',   href: '/products?category=skincare' },
  { name: 'Haircare',   href: '/products?category=haircare' },
  { name: 'Body Care',  href: '/products?category=bodycare' },
  { name: 'Gift Sets',  href: '/products?category=gifts' },
];

const legalLinks = [
  { name: 'Privacy Policy',   href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Shipping Info',    href: '/shipping' },
  { name: 'Contact Us',       href: '/contact' },
];

const FadeUp = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ fontFamily: TOKEN.fontBody, background: "linear-gradient(135deg, #0a1a14 0%, #1a3a2e 40%, #0f2318 70%, #0a1a14 100%)" }}
      aria-label="Site footer"
    >
      {/* ── decorative background elements ── */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* ── top accent line ── */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">

        {/* ══ MAIN GRID ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">

          {/* ── BRAND ── */}
          <FadeUp delay={0} className="sm:col-span-2 lg:col-span-1">
            {/* Logo / wordmark */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}>
                <FaLeaf className="text-[#1a3a2e] text-base" />
              </div>
              <div style={{ fontFamily: TOKEN.fontDisplay }} className="text-xl font-bold leading-tight">
                Tee Natural<br/>
                <span className="text-[#d4af37] text-sm font-normal tracking-widest uppercase" style={{ fontFamily: TOKEN.fontAccent }}>
                  & Essentials
                </span>
              </div>
            </div>

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xs">
              Natural beauty, naturally you. Every product is crafted with ethically sourced botanicals — free from parabens, sulphates, and artificial fragrances.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-10 h-10 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:border-[#d4af37] hover:bg-[#d4af37]/15 group"
                  >
                    <Icon className="text-white/70 text-base group-hover:text-[#d4af37] transition-colors" />
                  </motion.a>
                );
              })}
            </div>
          </FadeUp>

          {/* ── QUICK LINKS ── */}
          <FadeUp delay={0.1}>
            <h3 style={{ fontFamily: TOKEN.fontDisplay }} className="text-[#d4af37] font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-[#d4af37]/60 inline-block" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-[#d4af37] text-sm flex items-center gap-2.5 transition-colors group"
                  >
                    <FaArrowRight className="text-[#d4af37]/40 text-[9px] group-hover:text-[#d4af37] transition-colors flex-shrink-0" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </FadeUp>

          {/* ── SHOP ── */}
          <FadeUp delay={0.15}>
            <h3 style={{ fontFamily: TOKEN.fontDisplay }} className="text-[#d4af37] font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-[#d4af37]/60 inline-block" />
              Shop
            </h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link, i) => (
                <motion.li key={i} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-[#d4af37] text-sm flex items-center gap-2.5 transition-colors group"
                  >
                    <FaArrowRight className="text-[#d4af37]/40 text-[9px] group-hover:text-[#d4af37] transition-colors flex-shrink-0" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Trust badge */}
            <div className="mt-7 flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2.5">
              <FaLeaf className="text-[#d4af37] text-xs flex-shrink-0" />
              <span className="text-white/50 text-[11px] leading-tight">100% Natural · No Harsh Chemicals</span>
            </div>
          </FadeUp>

          {/* ── SPINNING BADGE + TAGLINE ── */}
          <FadeUp delay={0.2} className="flex flex-col items-center justify-start text-center">
            <div className="relative mb-5">
              {/* outer glow ring */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#d4af37]/30 blur-xl"
              />
              {/* spinning circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8952a] flex items-center justify-center"
                style={{ boxShadow: "0 8px 32px rgba(212,175,55,0.45)" }}
              >
                <FaSpa className="text-[#1a3a2e] text-3xl" />
              </motion.div>
            </div>

            <p style={{ fontFamily: TOKEN.fontAccent }}
              className="text-white/80 text-lg italic leading-snug mb-1">
              Pure. Natural.<br/>Elegant.
            </p>
            <p className="text-white/40 text-xs leading-relaxed max-w-[160px]">
              Handcrafted beauty essentials for your everyday glow.
            </p>

            {/* CTA */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-5 w-full">
              <Link to="/products"
                className="block w-full text-center bg-[#d4af37] text-[#1a3a2e] text-xs font-bold px-4 py-2.5 rounded-full transition-all hover:bg-[#f0d060]"
                style={{ boxShadow: "0 4px 16px rgba(212,175,55,0.3)" }}>
                Shop Now →
              </Link>
            </motion.div>
          </FadeUp>

        </div>

        {/* ══ DIVIDER ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-8 origin-left"
        />

        {/* ══ BOTTOM BAR ═════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">

          <p className="text-white/35 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Tee Natural & Essentials. All rights reserved.
            <span className="mx-2 text-white/20">·</span>
            Made with <FaHeart className="inline text-[#1156e1] text-[9px] mx-0.5" /> by MD Codes
          </p>

          {/* Legal links — wrap on small screens */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {legalLinks.map((link, i) => (
              <motion.div key={i} whileHover={{ y: -1 }}>
                <Link to={link.href}
                  className="text-white/40 hover:text-[#d4af37] text-xs transition-colors">
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;