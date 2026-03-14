import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-ayur-green/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-ayur-cream w-full max-w-md rounded-[2.5rem] shadow-2xl border border-ayur-gold/20 overflow-hidden"
                    >
                        {/* Header / Icon */}
                        <div className="pt-10 pb-6 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg border border-ayur-gold/10 mb-6">
                                <LogOut size={36} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-ayur-green text-center px-6">
                                Confirm Logout
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="px-10 pb-10 text-center">
                            <p className="text-ayur-charcoal/60 font-sans leading-relaxed">
                                Are you sure you want to end your session? You will need to login again to access your clinical dashboard.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="p-8 bg-white/50 border-t border-ayur-gold/10 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl font-bold text-ayur-green border border-ayur-green/10 hover:bg-white transition-all text-sm"
                            >
                                No, Stay
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm flex items-center justify-center gap-2"
                            >
                                Yes, Logout
                            </button>
                        </div>

                        {/* Close Tag */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-ayur-green/20 hover:text-ayur-green transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LogoutModal;
