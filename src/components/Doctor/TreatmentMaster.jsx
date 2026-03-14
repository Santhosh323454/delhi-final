import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Save, X, List, Lock, Unlock } from 'lucide-react';
import { useTherapy } from '../../context/TherapyContext';
import { Navigate } from 'react-router-dom';

const TreatmentMaster = () => {
    const { user, masterTemplates, updateMasterTemplate } = useTherapy();
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [draftRules, setDraftRules] = useState({ dos: '', donts: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [treatments, setTreatments] = useState([]);
    
    // Fetch doctor specializations from backend on mount
    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const { default: api } = await import('../../api/axiosConfig');
                const res = await api.get('/protocols/list');
                if (res.data) {
                    const splitList = [];
                    res.data.forEach(item => {
                        const parts = item.split(',').map(p => p.trim()).filter(p => p);
                        parts.forEach(newItem => {
                            if (!splitList.includes(newItem)) {
                                splitList.push(newItem);
                            }
                        });
                    });
                    setTreatments(splitList);
                }
            } catch (err) {
                console.error('Failed to fetch specializations', err);
            }
        };
        fetchTreatments();
    }, []);

    const [newTherapyName, setNewTherapyName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSelect = (key) => {
        const normalizedKey = key.trim();
        setSelectedTherapy(normalizedKey);
        // Reset to empty — useEffect will fetch from DB if exists
        setDraftRules({ dos: '', donts: '' });
        setIsLocked(false);
    };

    const handleAddTherapy = async () => {
        const name = newTherapyName.trim();
        if (!name) return;
        
        setIsAdding(true);
        try {
            const { default: api } = await import('../../api/axiosConfig');
            // Save empty protocol to DB
            await api.post('/protocols/save', {
                therapyName: name,
                dos: '',
                donts: ''
            });
            
            // Add to local list if not present
            if (!treatments.includes(name)) {
                setTreatments(prev => [...prev, name].sort());
            }
            
            // Clear input and select it
            setNewTherapyName('');
            handleSelect(name);
        } catch (error) {
            console.error("Failed to add new therapy:", error);
            alert("Failed to create new therapy.");
        } finally {
            setIsAdding(false);
        }
    };

    useEffect(() => {
        const fetchProtocol = async () => {
            if (!selectedTherapy) return;
            try {
                const { default: api } = await import('../../api/axiosConfig');
                const res = await api.get(`/protocols/${selectedTherapy}`);
                if (res.data) {
                    setDraftRules({
                        dos: res.data.dos || '',
                        donts: res.data.donts || ''
                    });
                    setIsLocked(res.data.locked || false);
                }
            } catch (err) {
                // If 404, fallback to master templates Context or empty
                setDraftRules({ 
                    dos: masterTemplates[selectedTherapy]?.dos || '', 
                    donts: masterTemplates[selectedTherapy]?.donts || '' 
                });
                setIsLocked(masterTemplates[selectedTherapy]?.locked || false);
            }
        };

        fetchProtocol();
    }, [selectedTherapy, masterTemplates]);

    if (user?.role !== 'admin' && user?.role !== 'doctor') {
        return <Navigate to="/" replace />;
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.post('/protocols/save', {
                therapyName: selectedTherapy,
                dos: draftRules.dos,
                donts: draftRules.donts
            });
            // Also update the local context state so the changes reflect immediately
            updateMasterTemplate(selectedTherapy, { ...draftRules, locked: isLocked });
            alert("Master Protocol updated successfully in the Database.");
        } catch (error) {
            console.error("Failed to save protocol:", error);
            alert("Failed to save Protocol. Are you an Admin?");
        } finally {
            setTimeout(() => {
                setIsSaving(false);
                setSelectedTherapy(null);
            }, 600);
        }
    };

    // derived state for filtering

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-ayur-cream rounded-xl text-ayur-green">
                        <BookOpen size={24} className="text-ayur-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-ayur-green">Treatment Master</h1>
                        <p className="text-xs text-ayur-charcoal/60 font-sans uppercase tracking-widest mt-1">
                            Standard Protocol Management
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="bg-white rounded-[2rem] shadow-sm border border-ayur-gold/10 overflow-hidden flex flex-col max-h-[620px]">
                    {/* Header & Add New */}
                    <div className="px-6 py-5 border-b border-ayur-gold/10 space-y-4">
                        <div>
                            <h2 className="font-serif font-bold text-lg text-ayur-green">Treatment List</h2>
                            <p className="text-xs text-ayur-charcoal/50 mt-1">Defined Master Protocols</p>
                        </div>
                        
                        {/* Add New Therapy Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTherapyName}
                                onChange={(e) => setNewTherapyName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTherapy()}
                                placeholder="Add New Therapy..."
                                className="flex-1 px-4 py-2 bg-ayur-cream/50 border border-ayur-gold/10 rounded-xl focus:outline-none focus:border-ayur-gold text-sm font-sans"
                                disabled={isAdding}
                            />
                            <button
                                onClick={handleAddTherapy}
                                disabled={!newTherapyName.trim() || isAdding}
                                className="w-10 h-10 bg-ayur-green text-white rounded-xl flex items-center justify-center hover:bg-ayur-green/90 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                            >
                                {isAdding ? <span className="animate-spin text-xs">...</span> : '+'}
                            </button>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="overflow-y-auto flex-1">
                        {treatments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
                                <BookOpen size={36} className="text-ayur-gold/30" />
                                <p className="text-sm text-ayur-charcoal/50 italic">
                                    No treatments registered by doctors yet.
                                </p>
                            </div>
                        ) : (
                            treatments.map((t) => {
                                const isSelected = selectedTherapy === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => handleSelect(t)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 text-left border-b border-gray-50 transition-all ${
                                            isSelected
                                                ? 'bg-ayur-green text-white'
                                                : 'hover:bg-ayur-cream text-ayur-charcoal'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-ayur-gold' : 'bg-ayur-green/20'}`} />
                                        <span className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-ayur-charcoal'}`}>
                                            {t}
                                        </span>
                                        {isSelected && (
                                            <div className="ml-auto text-ayur-gold">
                                                <List size={14} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedTherapy ? (
                            <motion.div
                                key={selectedTherapy}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2rem] p-8 shadow-sm border border-ayur-gold/10"
                            >
                                <div className="flex justify-between items-center border-b border-ayur-gold/10 pb-6 mb-6">
                                    <h2 className="text-2xl font-serif font-bold text-ayur-green">
                                        Protocol for {selectedTherapy}
                                    </h2>
                                    <button
                                        onClick={() => setSelectedTherapy(null)}
                                        className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-ayur-charcoal/50 uppercase tracking-widest mb-3">
                                            Do’s (Treatment Instructions)
                                        </label>
                                        <textarea
                                            disabled={isLocked}
                                            value={draftRules.dos}
                                            onChange={(e) => setDraftRules({ ...draftRules, dos: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border-2 transition-all font-sans text-ayur-charcoal resize-none shadow-inner ${isLocked ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70' : 'bg-ayur-cream border-transparent focus:border-ayur-gold/50 focus:outline-none focus:ring-4 focus:ring-ayur-gold/10'}`}
                                            rows="4"
                                            placeholder="Enter what the patient SHOULD do..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-ayur-charcoal/50 uppercase tracking-widest mb-3">
                                            Don’ts (Precautions)
                                        </label>
                                        <textarea
                                            disabled={isLocked}
                                            value={draftRules.donts}
                                            onChange={(e) => setDraftRules({ ...draftRules, donts: e.target.value })}
                                            className={`w-full p-4 rounded-2xl border-2 transition-all font-sans text-ayur-charcoal resize-none shadow-inner ${isLocked ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70' : 'bg-ayur-cream border-transparent focus:border-ayur-gold/50 focus:outline-none focus:ring-4 focus:ring-ayur-gold/10'}`}
                                            rows="4"
                                            placeholder="Enter what the patient SHOULD AVOID..."
                                        />
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <button
                                            onClick={() => setIsLocked(!isLocked)}
                                            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all border-2 ${isLocked ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}
                                        >
                                            {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                                            {isLocked ? 'Protocol Locked' : 'Protocol Unlocked'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving || isLocked}
                                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:shadow-lg hover:-translate-y-1'}`}
                                        >
                                            <Save size={18} />
                                            {isSaving ? 'Saving...' : 'Save Protocol'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center bg-white/50 rounded-[2rem] border-2 border-dashed border-ayur-gold/20 p-12 text-center"
                            >
                                <BookOpen size={48} className="text-ayur-gold/40 mb-4" />
                                <h3 className="text-xl font-serif font-bold text-ayur-green mb-2">Select a Protocol</h3>
                                <p className="text-ayur-charcoal/60 max-w-sm mx-auto">
                                    Please select a therapy to define its protocol
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default TreatmentMaster;
