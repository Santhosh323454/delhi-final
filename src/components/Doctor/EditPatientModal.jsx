import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, X } from 'lucide-react';

const EditPatientModal = ({ patient, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: patient.user?.name || patient.name || '',
        phone: patient.user?.phone || '',
        currentTherapy: patient.currentTherapy || 'Consultation',
        status: patient.status || 'Active',
        recoveryProgress: patient.recoveryProgress ?? 0
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { default: api } = await import('../../api/axiosConfig');
            // Sending updated details to /api/doctor/patients/${id}
            await api.put(`/doctor/patients/${patient.id}`, formData);
            
            import('react-hot-toast').then(module => {
                module.default.success(`Patient details updated successfully!`);
            });
            onSave(patient.id, formData);
        } catch (error) {
            console.error("Edit failed:", error);
            import('react-hot-toast').then(module => {
                module.default.error(`Failed to update patient details.`);
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-ayur-charcoal/40 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl z-10 w-full max-w-lg overflow-hidden border border-ayur-gold/20 flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="bg-ayur-green px-8 py-6 relative shrink-0">
                        <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl text-ayur-gold">
                                <Edit size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-white font-bold">Edit Patient Details</h2>
                                <p className="text-ayur-cream/80 text-sm mt-1">Update {formData.name}'s profile and progress</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-ayur-green uppercase tracking-widest mb-2 block">Patient Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-ayur-cream/30 border border-ayur-gold/30 rounded-xl px-4 py-3 text-ayur-charcoal focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold font-sans placeholder-gray-400 text-sm transition-all" placeholder="Patient's Full Name" />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-ayur-green uppercase tracking-widest mb-2 block">Phone Number</label>
                                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-ayur-cream/30 border border-ayur-gold/30 rounded-xl px-4 py-3 text-ayur-charcoal focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold font-sans placeholder-gray-400 text-sm transition-all" placeholder="+91 9876543210" />
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-bold text-ayur-green uppercase tracking-widest mb-2 block">Therapy Phase</label>
                                <select value={formData.currentTherapy} onChange={(e) => setFormData({...formData, currentTherapy: e.target.value})} className="w-full bg-ayur-cream/30 border border-ayur-gold/30 rounded-xl px-4 py-3 text-ayur-charcoal focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold font-sans text-sm appearance-none cursor-pointer transition-all">
                                    <option value="Consultation">Consultation</option>
                                    <option value="Vamana">Vamana</option>
                                    <option value="Basti">Basti</option>
                                    <option value="Virechana">Virechana</option>
                                    <option value="Nasya">Nasya</option>
                                    <option value="Raktamokshana">Raktamokshana</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="text-xs font-bold text-ayur-green uppercase tracking-widest mb-2 block">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-ayur-cream/30 border border-ayur-gold/30 rounded-xl px-4 py-3 text-ayur-charcoal focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold font-sans text-sm appearance-none cursor-pointer transition-all">
                                    <option value="Active">Active</option>
                                    <option value="Waitlist">Waitlist</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold text-ayur-green uppercase tracking-widest mb-2 flex justify-between">
                                    <span>Recovery Progress</span>
                                    <span className="text-ayur-gold">{formData.recoveryProgress}%</span>
                                </label>
                                <input type="range" min="0" max="100" value={formData.recoveryProgress} onChange={(e) => setFormData({...formData, recoveryProgress: parseInt(e.target.value)})} className="w-full h-2 bg-ayur-cream rounded-lg appearance-none cursor-pointer accent-ayur-gold" />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold px-1">
                                    <span>0% (Start)</span>
                                    <span>50%</span>
                                    <span>100% (Healed)</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 mt-6 border-t border-ayur-gold/10">
                            <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 rounded-xl border-2 border-ayur-cream text-ayur-charcoal font-bold text-sm tracking-wide hover:bg-ayur-cream hover:text-ayur-green transition-all" >
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-ayur-green text-white font-bold text-sm tracking-wide hover:bg-ayur-green/90 shadow-lg shadow-ayur-green/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70" >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Edit size={16} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditPatientModal;
