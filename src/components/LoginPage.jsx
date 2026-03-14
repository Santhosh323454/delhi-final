import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, ShieldCheck, ArrowRight, User, Lock, Shield } from 'lucide-react';
import { useTherapy } from '../context/TherapyContext';
import api from '../api/axiosConfig';

const LoginPage = () => {
    const { login } = useTherapy();
    const navigate = useNavigate();
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        secretCode: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const verifyRes = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password
            });

            login(verifyRes.data);
            toast.success('Login Successful');

            if (verifyRes.data.role === 'ADMIN') navigate('/admin/dashboard');
            else if (verifyRes.data.role === 'DOCTOR') navigate('/doctor/patients');
            else navigate('/patient/my-plan');
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ayur-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-48 -left-48 w-96 h-96 bg-ayur-green rounded-full blur-[120px]" />
                <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-ayur-gold rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10 mb-12"
            >
                <div className="inline-flex p-5 bg-white rounded-[2rem] shadow-2xl mb-8 border border-ayur-gold/20 relative group cursor-pointer" onClick={() => { setIsAdminLogin(!isAdminLogin); setFormData({ ...formData, password: '' }) }}>
                    {isAdminLogin ? (
                        <ShieldCheck className="text-ayur-green group-hover:scale-110 transition-transform duration-500" size={56} />
                    ) : (
                        <Leaf className="text-ayur-green group-hover:rotate-12 transition-transform duration-500" size={56} />
                    )}
                    <Sparkles className="absolute -top-2 -right-2 text-ayur-gold animate-pulse" size={24} />
                </div>
                <h1 className="text-7xl font-serif font-bold text-ayur-green mb-4 tracking-tighter">AyurSutra</h1>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="h-px w-12 bg-ayur-gold/30" />
                    <p className="text-xs font-bold text-ayur-gold uppercase tracking-[0.4em]">Therapeutic Excellence</p>
                    <div className="h-px w-12 bg-ayur-gold/30" />
                </div>
            </motion.div>

            <div className="w-full max-w-md z-10 font-sans mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-[3rem] shadow-2xl border border-ayur-gold/20 relative w-full"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isAdminLogin ? "admin" : "user"}
                                initial={{ x: isAdminLogin ? -20 : 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: isAdminLogin ? 20 : -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {!isAdminLogin ? (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Patient ID / Doctor ID</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User size={18} className="text-ayur-green/50" />
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-4 bg-ayur-cream/50 border border-ayur-gold/20 rounded-2xl focus:outline-none focus:border-ayur-gold focus:ring-4 focus:ring-ayur-gold/10 transition-all font-sans text-sm"
                                                    placeholder="e.g. AS-2026-XXX or DOC-XXX"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-gold uppercase tracking-widest pl-2 mb-1 block">Admin ID</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Shield size={18} className="text-ayur-gold/80" />
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-4 bg-ayur-gold/5 border-2 border-ayur-gold/30 rounded-2xl focus:outline-none focus:border-ayur-gold focus:ring-4 focus:ring-ayur-gold/10 transition-all font-sans text-sm"
                                                    placeholder="Enter Admin ID"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Access Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-ayur-green/50" />
                                        </div>
                                        <input
                                            required
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-5 py-4 bg-ayur-cream/50 border border-ayur-gold/20 rounded-2xl focus:outline-none focus:border-ayur-gold focus:ring-4 focus:ring-ayur-gold/10 transition-all font-sans text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-4 bg-gradient-to-r from-ayur-green to-[#23451e] text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-ayur-green/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    SECURE LOGIN <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <footer className="mt-8 text-ayur-charcoal/30 font-sans text-[10px] font-bold uppercase tracking-[0.5em] z-10 flex items-center gap-4">
                <div className="h-px w-8 bg-ayur-gold/20" />
                © 2026 AyurSutra Management Suite
                <div className="h-px w-8 bg-ayur-gold/20" />
            </footer>
        </div>
    );
};

export default LoginPage;
