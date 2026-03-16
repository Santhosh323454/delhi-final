import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserPlus, Database, Activity, CheckCircle, ShieldCheck, Bell, RefreshCw, AlertTriangle, Loader } from 'lucide-react';
import { useTherapy } from '../../context/TherapyContext';
import api from '../../api/axiosConfig';

const AdminDashboard = () => {
    const { user } = useTherapy();
    const [doctors, setDoctors] = useState([]);
    const [availableTreatments, setAvailableTreatments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: ''
    });

    useEffect(() => {
        fetchDoctors();
        fetchProtocols();
    }, []);

    const fetchProtocols = async () => {
        try {
            const res = await api.get('/protocols/list');
            console.log('Treatments from Admin:', res.data);
            setAvailableTreatments(res.data || []);
            if (res.data && res.data.length > 0 && !formData.specialization) {
                setFormData(prev => ({ ...prev, specialization: res.data[0] }));
            }
        } catch (error) {
            console.error("Failed to fetch allowed protocols", error);
        }
    };

    const fetchDoctors = async () => {
        setDoctorsLoading(true);
        setFetchError('');
        try {
            const res = await api.get('/admin/doctors');
            setDoctors(res.data || []);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
            const msg = error.response?.data?.message || error.message || 'Failed to load doctors';
            setFetchError(msg);
            toast.error('Could not load doctors list');
        } finally {
            setDoctorsLoading(false);
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        try {
            const res = await api.post('/admin/doctors', formData);
            setSuccess('Doctor profile created successfully!');
            toast.success('Doctor successfully onboarded!');
            // Show newly created doctor credentials immediately
            setSelectedDoctor(res.data);
            // ✅ Immediately add to list — no re-fetch needed
            setDoctors(prev => [...prev, res.data]);
            setFormData({ 
                name: '', email: '', phone: '', 
                specialization: availableTreatments.length > 0 ? availableTreatments[0] : '' 
            });
        } catch (error) {
            console.error("Failed to add doctor", error);
            toast.error('Failed to create Doctor account');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-ayur-green">
                <ShieldAlert size={64} className="mb-6 opacity-20" />
                <h2 className="text-3xl font-serif font-bold">Classified Sector</h2>
                <p className="opacity-50 mt-2">Level 4 Clearance Required</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-5xl font-serif font-bold text-ayur-green mb-2 flex items-center gap-4">
                        <ShieldCheck size={40} className="text-ayur-gold" /> System Control
                    </h1>
                    <p className="text-ayur-gold font-bold uppercase tracking-[0.3em] text-xs">AyurSutra Administrative Core</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-ayur-gold/20 hover:bg-white transition-all">
                        <Bell size={20} className="text-ayur-green" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                    <div className="bg-red-50 text-red-600 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-sm border border-red-100">
                        <Database size={16} /> Root Access Active
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Add Doctor Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[3rem] shadow-xl border border-ayur-gold/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-ayur-green rounded-2xl flex items-center justify-center text-ayur-cream shadow-inner">
                                <UserPlus size={24} />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-ayur-green">Onboard Doctor</h2>
                        </div>

                        {success && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6 border border-green-100">
                                <CheckCircle size={18} /> {success}
                            </div>
                        )}

                        <form onSubmit={handleAddDoctor} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-ayur-cream/50 border border-ayur-gold/10 rounded-2xl focus:outline-none focus:border-ayur-gold font-sans text-sm"
                                    placeholder="Dr. Rajesh"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-4 bg-ayur-cream/50 border border-ayur-gold/10 rounded-2xl focus:outline-none focus:border-ayur-gold font-sans text-sm"
                                    placeholder="doctor@ayur.com"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-5 py-4 bg-ayur-cream/50 border border-ayur-gold/10 rounded-2xl focus:outline-none focus:border-ayur-gold font-sans text-sm"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div key={availableTreatments.length}>
                                <label className="text-[10px] font-bold text-ayur-green uppercase tracking-widest pl-2 mb-1 block">Specialization</label>
                                <input
                                    required
                                    type="text"
                                    list="treatments"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    className="w-full px-5 py-4 bg-ayur-cream/50 border border-ayur-gold/10 rounded-2xl focus:outline-none focus:border-ayur-gold font-sans text-sm"
                                    placeholder="Search or type specialization..."
                                />
                                <datalist id="treatments">
                                    {availableTreatments.map(t => (
                                        <option key={t} value={t} />
                                    ))}
                                </datalist>
                                {formData.specialization && !availableTreatments.includes(formData.specialization) && (
                                    <p className="text-[10px] text-amber-600 mt-2 pl-2 font-bold bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                                        ⚠️ Note: Master Protocol must be created first for this therapy in Treatment Master.
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-ayur-green text-white py-4 rounded-2xl font-bold hover:bg-ayur-green/90 transition-all shadow-xl disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Provisioning...' : 'Provision Account'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Directory */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[3rem] shadow-xl border border-ayur-gold/20 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-bold text-ayur-green">Active Practitioners</h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchDoctors}
                                    disabled={doctorsLoading}
                                    className="p-2 bg-ayur-cream/50 text-ayur-green rounded-full hover:bg-ayur-cream transition-all disabled:opacity-40"
                                    title="Refresh doctors list"
                                >
                                    <RefreshCw size={15} className={doctorsLoading ? 'animate-spin' : ''} />
                                </button>
                                <div className="bg-ayur-cream/50 text-ayur-green px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">
                                    {doctors.length} Registered
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {doctorsLoading ? (
                                <div className="text-center py-20 text-ayur-green/40">
                                    <Loader size={40} className="mx-auto mb-4 animate-spin" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Loading Practitioners...</p>
                                </div>
                            ) : fetchError ? (
                                <div className="text-center py-16 text-red-400">
                                    <AlertTriangle size={40} className="mx-auto mb-4 opacity-60" />
                                    <p className="font-bold text-sm mb-1">Failed to load doctors</p>
                                    <p className="text-xs opacity-60 mb-4">{fetchError}</p>
                                    <button
                                        onClick={fetchDoctors}
                                        className="bg-red-50 text-red-500 border border-red-200 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="text-center py-20 text-ayur-charcoal/30">
                                    <Activity size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-sm">No Doctors Registered Yet</p>
                                </div>
                            ) : (
                                doctors.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-ayur-cream/30 rounded-3xl border border-ayur-gold/10 hover:border-ayur-gold/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-ayur-gold font-serif font-bold text-xl shadow-sm">
                                                {doc.user?.name?.charAt(0) || 'D'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-ayur-green text-lg">{doc.user?.name}</h3>
                                                <p className="text-xs font-bold text-ayur-gold uppercase tracking-widest">{doc.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-right">
                                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold w-fit">
                                                {doc.user?.username}
                                            </div>
                                            <button
                                                onClick={() => setSelectedDoctor(doc)}
                                                className="text-[10px] uppercase font-bold tracking-widest text-ayur-gold hover:text-ayur-green transition-colors"
                                            >
                                                View Credentials
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Credential Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-ayur-charcoal/30 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedDoctor(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-ayur-cream p-8 rounded-[2rem] shadow-2xl border border-ayur-gold/20 max-w-sm w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ayur-green to-ayur-gold" />
                            <h3 className="text-xl font-serif font-bold text-ayur-green mb-6 flex items-center gap-2">
                                <ShieldCheck size={24} className="text-ayur-gold" /> Identity Issued
                            </h3>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-ayur-gold/10 space-y-4 font-sans text-sm">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-ayur-green/70 mb-1">Doctor Name</p>
                                    <p className="font-bold text-ayur-charcoal">{selectedDoctor.user?.name}</p>
                                </div>
                                <div className="h-px bg-ayur-gold/10 w-full" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-ayur-green/70 mb-1">Login ID</p>
                                    <p className="font-mono font-bold text-ayur-green bg-ayur-green/5 py-1 px-2 rounded w-fit select-all">
                                        {selectedDoctor.user?.username}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-ayur-gold mb-1">Generated Password</p>
                                    <p className="font-mono font-bold text-ayur-gold bg-ayur-gold/5 py-1 px-2 rounded w-fit select-all">
                                        {selectedDoctor.user?.plainPassword || 'Hidden (Contact Admin)'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`Login ID: ${selectedDoctor.user?.username}\nPassword: ${selectedDoctor.user?.plainPassword}`);
                                    setSelectedDoctor(null);
                                }}
                                className="w-full mt-6 bg-ayur-green text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-ayur-green/90 transition-all shadow-md"
                            >
                                Copy Details & Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
