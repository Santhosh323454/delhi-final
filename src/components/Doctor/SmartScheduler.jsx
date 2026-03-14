import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Plus, User, Check, AlertCircle } from 'lucide-react';
import { useTherapy } from '../../context/TherapyContext';
import { useNavigate } from 'react-router-dom';

const SmartScheduler = ({ isOpen = true, onClose }) => {
    const { patients, masterTemplates } = useTherapy();
    const navigate = useNavigate();
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedTherapy, setSelectedTherapy] = useState('');
    const [duration, setDuration] = useState('7');

    if (!isOpen) return null;

    const therapyTypes = Object.keys(masterTemplates || {});

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/doctor/patients');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-ayur-green/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-ayur-gold/20"
            >
                <div className="bg-ayur-green p-8 flex justify-between items-center text-ayur-cream">
                    <div>
                        <h2 className="text-3xl font-serif font-bold">Treatment Planner</h2>
                        <p className="text-ayur-gold text-sm opacity-80 uppercase tracking-widest font-bold mt-1">Assign Panchakarma Regimen</p>
                    </div>
                    <button onClick={handleClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Patient Selection */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-ayur-green uppercase tracking-[0.2em]">
                                <User size={14} /> Select Patient
                            </label>
                            <select
                                className="w-full px-5 py-4 bg-ayur-cream border border-ayur-gold/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ayur-gold/50 appearance-none font-sans font-bold text-ayur-green"
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                            >
                                <option value="">Choose Patient</option>
                                {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* Therapy Type */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-ayur-green uppercase tracking-[0.2em]">
                                <Calendar size={14} /> Therapy Type
                            </label>
                            <select
                                className="w-full px-5 py-4 bg-ayur-cream border border-ayur-gold/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ayur-gold/50 appearance-none font-sans font-bold text-ayur-green"
                                value={selectedTherapy}
                                onChange={(e) => setSelectedTherapy(e.target.value)}
                            >
                                <option value="">Select Protocol</option>
                                {therapyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Duration Cards */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-ayur-green uppercase tracking-[0.2em]">Protocol Duration</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['7', '14', '21'].map(days => (
                                <button
                                    key={days}
                                    onClick={() => setDuration(days)}
                                    className={`py-4 rounded-2xl border-2 transition-all font-bold ${duration === days
                                            ? 'bg-ayur-gold border-ayur-gold text-white shadow-lg scale-[1.05]'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-ayur-gold/30'
                                        }`}
                                >
                                    {days} Days
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Smart Rules Preview */}
                    <AnimatePresence>
                        {selectedTherapy && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/20 flex gap-4"
                            >
                                <div className="bg-white p-3 rounded-xl shadow-sm h-fit">
                                    <AlertCircle className="text-ayur-gold" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-ayur-gold uppercase tracking-widest">Auto-Applied Rules</p>
                                    <h4 className="font-serif font-bold text-ayur-green text-lg">{selectedTherapy} Protocol</h4>
                                    <ul className="mt-2 space-y-1">
                                        <li className="text-sm font-sans flex items-center gap-2 text-gray-600">
                                            <div className="w-1.5 h-1.5 bg-ayur-gold rounded-full" />
                                            Dos: {masterTemplates[selectedTherapy]?.dos}
                                        </li>
                                        <li className="text-sm font-sans flex items-center gap-2 text-gray-600">
                                            <div className="w-1.5 h-1.5 bg-ayur-gold rounded-full" />
                                            Don'ts: {masterTemplates[selectedTherapy]?.donts}
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        className="w-full bg-ayur-green text-ayur-cream py-5 rounded-2xl font-bold text-xl shadow-2xl hover:bg-ayur-green/90 transition-all flex items-center justify-center gap-3 group"
                    >
                        Generate Schedule Plan
                        <Plus className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SmartScheduler;
