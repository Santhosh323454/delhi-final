import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, Pill, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const TreatmentModal = ({ isOpen, onClose, patientId, patientName, onTreatmentSaved }) => {
    const [formData, setFormData] = useState({
        treatmentMethod: '',
        medicines: '',
        notes: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.treatmentMethod.trim()) {
            toast.error('Treatment Method is required');
            return;
        }

        setIsSaving(true);
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.post('/treatments', {
                patientId,
                ...formData
            });
            toast.success('Treatment record saved successfully');
            onTreatmentSaved();
            onClose();
            setFormData({ treatmentMethod: '', medicines: '', notes: '' });
        } catch (error) {
            console.error("Error saving treatment:", error);
            toast.error('Failed to save treatment record');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-ayur-charcoal/40 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-ayur-gold/20"
                >
                    {/* Header */}
                    <div className="bg-ayur-cream p-6 border-b border-ayur-gold/20 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-ayur-green">Treatment Note</h2>
                            <p className="text-xs text-ayur-charcoal/60 uppercase tracking-widest font-bold mt-1">
                                For patient: {patientName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-full transition-colors text-ayur-charcoal/40 hover:text-red-500"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-ayur-green mb-1">
                                <Stethoscope size={16} className="text-ayur-gold" />
                                Treatment Method
                            </label>
                            <textarea
                                value={formData.treatmentMethod}
                                onChange={(e) => setFormData({ ...formData, treatmentMethod: e.target.value })}
                                placeholder="e.g., Shirodhara 45 mins, Vamana induction..."
                                className="w-full text-sm font-sans p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold transition-all"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-ayur-green mb-1">
                                <Pill size={16} className="text-ayur-gold" />
                                Medicines / Tablets
                            </label>
                            <textarea
                                value={formData.medicines}
                                onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                                placeholder="e.g., Ashwagandha 500mg BID, Triphala powder..."
                                className="w-full text-sm font-sans p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold transition-all"
                                rows="2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-ayur-green mb-1">
                                <FileText size={16} className="text-ayur-gold" />
                                Doctor Notes (Internal)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Observations, vitals, next steps..."
                                className="w-full text-sm font-sans p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-ayur-gold focus:ring-1 focus:ring-ayur-gold transition-all"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-4 rounded-xl bg-ayur-green text-white font-bold text-sm shadow-xl shadow-ayur-green/20 hover:bg-ayur-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} /> Save Record
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

export default TreatmentModal;
