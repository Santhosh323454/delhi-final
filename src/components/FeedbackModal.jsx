import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Heart, ShieldCheck, Zap } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    const metrics = [
        { label: 'Energy Levels', icon: Zap, color: 'text-yellow-500' },
        { label: 'Pain Relief', icon: ShieldCheck, color: 'text-blue-500' },
        { label: 'Mental Clarity', icon: Heart, color: 'text-red-400' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-ayur-green/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-ayur-gold/20"
            >
                <div className="bg-ayur-cream p-10 flex justify-between items-center border-b border-ayur-gold/10">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-ayur-green">Post-Session Feedback</h2>
                        <p className="text-ayur-gold text-[10px] font-bold uppercase tracking-[0.2em] mt-2">March 09 • Evening Observation</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-colors text-ayur-green/40 hover:text-ayur-green shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* Star Rating */}
                    <div className="text-center">
                        <p className="text-sm font-bold text-ayur-green/40 uppercase tracking-widest mb-6 underline decoration-ayur-gold/30">Overall Experience</p>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-all transform duration-300 hover:scale-125"
                                >
                                    <Star
                                        size={48}
                                        className={`${(hoveredRating || rating) >= star
                                                ? 'fill-ayur-gold text-ayur-gold drop-shadow-lg'
                                                : 'text-ayur-cream stroke-[1.5px]'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-6">
                        {metrics.map((m, i) => (
                            <div key={i} className="bg-ayur-cream/50 p-4 rounded-2xl border border-transparent hover:border-ayur-gold/20 transition-all text-center">
                                <m.icon className={`${m.color} mx-auto mb-2`} size={24} />
                                <p className="text-[10px] font-bold text-ayur-green/60 uppercase">{m.label}</p>
                                <div className="flex justify-center gap-0.5 mt-2">
                                    {[1, 2, 3].map(d => <div key={d} className="w-2 h-2 rounded-full bg-ayur-gold/20" />)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-ayur-green uppercase tracking-widest">
                            <MessageSquare size={14} /> Observations or Concerns
                        </label>
                        <textarea
                            placeholder="How do you feel after today's Vamana?"
                            className="w-full px-6 py-5 bg-ayur-cream border border-ayur-gold/10 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-ayur-gold/10 font-sans text-sm h-32 resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="button"
                        className="w-full bg-ayur-green text-ayur-cream py-6 rounded-2xl font-bold text-lg shadow-xl hover:bg-ayur-green/90 transition-all flex items-center justify-center gap-3"
                    >
                        Submit to Dr. Sharma
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FeedbackModal;
