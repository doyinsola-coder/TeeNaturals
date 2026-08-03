import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaHeart, FaLeaf, FaUserCircle, FaTrash, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router';
import api from '../api/axios';

const ReviewsPage = () => {
  // ── Reviews fetched from the backend ────────────────────────────────────
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Logged-in profile (gates the submission form + delete-own-review) ──
  const [profile, setProfile]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Submission form state ───────────────────────────────────────────────
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const loadReviews = useCallback(() => {
    setLoading(true);
    setLoadError("");
    api.get("/reviews")
      .then(r => setReviews(Array.isArray(r.data) ? r.data : r.data?.reviews || []))
      .catch(() => setLoadError("Couldn't load reviews right now."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    const token = localStorage.getItem("tn_token");
    if (!token) { setProfileLoading(false); return; }
    api.get("/auth/profile")
      .then(r => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return setFormError("Please select a star rating.");
    if (!comment.trim()) return setFormError("Please write a short review.");

    setSubmitting(true);
    setFormError("");
    try {
      const { data: newReview } = await api.post("/reviews", {
        rating,
        comment: comment.trim(),
      });
      setReviews(prev => [newReview, ...prev]);
      setRating(0);
      setComment("");
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Editing an existing review ──────────────────────────────────────────
  const [editingId, setEditingId]   = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editHover, setEditHover]   = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState("");

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError("");
  };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    if (editRating === 0) return setEditError("Please select a star rating.");
    if (!editComment.trim()) return setEditError("Please write a short review.");
    setEditSaving(true);
    setEditError("");
    try {
      const { data: updated } = await api.put(`/reviews/${id}`, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setReviews(prev => prev.map(r => r._id === id ? updated : r));
      setEditingId(null);
    } catch (err) {
      setEditError(err?.response?.data?.message || err?.message || "Couldn't save changes.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      // silently ignore — worst case the review just stays visible until refresh
    }
  };

  const fmtReviewDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "";

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const stats = [
    { number: "500+", label: "Happy Customers" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "100%", label: "Natural Products" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f5f5dc] to-white">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative h-[50vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a2e] to-[#2d5a45] opacity-90" />
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 right-10 text-[#d4af37] opacity-20 text-9xl"
        >
          <FaHeart />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-10 text-[#d4af37] opacity-20 text-7xl"
        >
          <FaLeaf />
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="mb-6"
          >
            <FaStar className="text-6xl md:text-7xl text-[#d4af37] mx-auto" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 font-['Playfair_Display']"
          >
            Customer Reviews
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-white/90"
          >
            Real stories from real customers who trust Tee Natural & Essentials
          </motion.p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 px-6 -mt-16 relative z-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-xl text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#1a3a2e] mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ WRITE A REVIEW ═══════════════════════════════════════════════════ */}
      <section className="py-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1a3a2e] to-[#2d5a45] p-8 text-center">
              <FaStar className="text-5xl text-[#d4af37] mx-auto mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 font-['Playfair_Display']">
                Share Your Experience
              </h2>
              <p className="text-white/80 text-sm">Your review helps other customers, and helps us grow.</p>
            </div>

            <div className="p-8">
              {profileLoading ? (
                <div className="flex justify-center py-6">
                  <FaSpinner className="animate-spin text-2xl text-[#1a3a2e]/40" />
                </div>
              ) : !profile ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Log in to your account to leave a review.</p>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-[#1a3a2e] text-white px-8 py-3 rounded-full font-bold"
                    >
                      Log In
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  {/* Star picker */}
                  <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        <FaStar className={(hoverRating || rating) >= n ? "text-[#d4af37]" : "text-gray-200"} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us about your experience with our products…"
                    rows={4}
                    maxLength={1000}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-[#d4af37] focus:outline-none resize-none text-gray-700"
                  />

                  {formError && (
                    <p className="text-red-500 text-sm mt-3 text-center">{formError}</p>
                  )}
                  {formSuccess && (
                    <p className="text-green-600 text-sm mt-3 text-center font-medium">
                      Thank you! Your review has been posted. 🌿
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.97 } : {}}
                    className="w-full mt-5 bg-gradient-to-r from-[#1a3a2e] to-[#2d5a45] text-white py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    {submitting ? "Posting…" : "Post Review"}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a3a2e] mb-6 font-['Playfair_Display']">
              What Our Customers Say
            </h2>
            <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8" />
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers about their experience with our natural products
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-16">
              <FaSpinner className="animate-spin text-3xl text-[#1a3a2e]/40" />
            </div>
          ) : loadError ? (
            <p className="text-center text-gray-500">{loadError}</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews yet — be the first to share your experience!</p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {reviews.map((review) => {
                  const canDelete = profile && (profile._id === review.user || profile.role === "admin");
                  return (
                    <motion.div
                      key={review._id}
                      variants={fadeInUp}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative"
                    >
                      {/* Review Header */}
                      <div className="bg-gradient-to-br from-[#1a3a2e] to-[#2d5a45] p-6 text-white">
                        <div className="flex items-center gap-4 mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-3xl"
                          >
                            <FaUserCircle />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{review.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <FaStar key={i} className="text-[#d4af37] text-sm" />
                              ))}
                            </div>
                          </div>
                          {canDelete && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEdit(review)}
                                aria-label="Edit review"
                                className="text-white/50 hover:text-[#d4af37] transition-colors p-1 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                aria-label="Delete review"
                                className="text-white/50 hover:text-red-300 transition-colors p-1"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/80">
                          <span>{fmtReviewDate(review.createdAt)}</span>
                        </div>
                      </div>

                      {/* Review Content */}
                      {editingId === review._id ? (
                        <div className="p-6">
                          <div className="flex gap-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setEditRating(n)}
                                onMouseEnter={() => setEditHover(n)}
                                onMouseLeave={() => setEditHover(0)}
                                className="text-xl"
                              >
                                <FaStar className={(editHover || editRating) >= n ? "text-[#d4af37]" : "text-gray-200"} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editComment}
                            onChange={e => setEditComment(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#d4af37] focus:outline-none resize-none text-gray-700 text-sm"
                          />
                          {editError && <p className="text-red-500 text-xs mt-2">{editError}</p>}
                          <div className="flex gap-2 mt-3">
                            <motion.button
                              whileHover={!editSaving ? { scale: 1.03 } : {}}
                              whileTap={!editSaving ? { scale: 0.97 } : {}}
                              disabled={editSaving}
                              onClick={() => saveEdit(review._id)}
                              className="flex-1 bg-[#1a3a2e] text-white py-2 rounded-full text-sm font-semibold disabled:opacity-60"
                            >
                              {editSaving ? "Saving…" : "Save"}
                            </motion.button>
                            <button
                              onClick={cancelEdit}
                              disabled={editSaving}
                              className="px-4 py-2 rounded-full text-sm font-semibold text-gray-500 border border-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6">
                          <FaQuoteLeft className="text-[#d4af37] text-2xl mb-4 opacity-50" />
                          <p className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a2e] mb-6 font-['Playfair_Display']">
              Why Customers Trust Us
            </h2>
            <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-12" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaLeaf />,
                  title: "100% Natural",
                  description: "All our products are made from pure, natural ingredients"
                },
                {
                  icon: <FaHeart />,
                  title: "Proven Results",
                  description: "Thousands of satisfied customers with visible results"
                },
                {
                  icon: <FaStar />,
                  title: "Expert Formulated",
                  description: "Created by wellness experts with years of experience"
                }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-8"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-br from-[#1a3a2e] to-[#2d5a45] rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg"
                  >
                    {badge.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{badge.title}</h3>
                  <p className="text-gray-600">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1a3a2e] to-[#2d5a45]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <FaHeart className="text-6xl mx-auto mb-6 text-[#d4af37]" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Our Happy Customers?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the natural difference that has transformed the lives of hundreds of satisfied customers
          </p>
          <Link to="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#d4af37] hover:bg-[#c29d2f] text-[#1a3a2e] px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all"
          >
            Shop Now
          </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default ReviewsPage;