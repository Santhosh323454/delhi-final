import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Save, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * TreatmentPlanner — Modal for doctors to set:
 *   - Total Therapy Duration (Days): e.g. 30, 60, 90
 *   - Checkup Interval (Every X Days): e.g. 7, 10
 *
 * On "Save Plan" → POST /api/doctor/save-plan/${patient.id}
 * Backend auto-calculates nextCheckupDate and endDate.
 */
const TreatmentPlanner = ({ patient, onClose, onSaved }) => {
    const [totalDuration, setTotalDuration] = useState('');
    const [intervalDays, setIntervalDays]   = useState('');
    const [saving, setSaving]               = useState(false);
    const [result, setResult]               = useState(null); // { nextCheckupDate, endDate }
    const [error, setError]                 = useState('');

    // Pre-fill if patient already has a plan
    useEffect(() => {
        if (patient?.totalDuration) setTotalDuration(String(patient.totalDuration));
        if (patient?.intervalDays)  setIntervalDays(String(patient.intervalDays));
    }, [patient]);

    const patientName = patient?.user?.name || patient?.name || 'Patient';

    const validate = () => {
        const dur = parseInt(totalDuration, 10);
        const intv = parseInt(intervalDays, 10);
        if (!dur  || dur  <= 0) return 'Total Duration must be a positive number.';
        if (!intv || intv <= 0) return 'Checkup Interval must be a positive number.';
        if (intv >= dur)        return 'Interval must be less than total duration.';
        return null;
    };

    const handleSave = async () => {
        const validationErr = validate();
        if (validationErr) { setError(validationErr); return; }

        setSaving(true);
        setError('');
        try {
            const { default: api } = await import('../../api/axiosConfig');
            const res = await api.post(`/doctor/save-plan/${patient.id}`, {
                totalDuration: parseInt(totalDuration, 10),
                intervalDays:  parseInt(intervalDays,  10),
            });
            setResult(res.data);
            if (onSaved) onSaved(patient.id, res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save plan. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Quick presets for common durations
    const durationPresets = [30, 60, 90];
    const intervalPresets = [7, 10, 14];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-ayur-charcoal/50 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-ayur-gold/10 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-ayur-green px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-serif font-bold text-white">Treatment Planner</h2>
                            <p className="text-ayur-gold text-[11px] font-bold uppercase tracking-widest mt-1">
                                Assign Therapy Schedule
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-white/70 text-sm mt-3 font-sans">
                        Setting plan for <span className="text-ayur-gold font-bold">{patientName}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-7">

                    {/* ── Total Duration ─────────────────────── */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-ayur-charcoal/50 uppercase tracking-widest mb-3">
                            <Calendar size={13} />
                            Total Therapy Duration (Days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={totalDuration}
                            onChange={e => setTotalDuration(e.target.value)}
                            placeholder="e.g. 30, 60 or 90"
                            className="w-full px-4 py-3 rounded-2xl bg-ayur-cream border-2 border-transparent focus:border-ayur-gold/50 focus:outline-none focus:ring-4 focus:ring-ayur-gold/10 text-ayur-charcoal font-sans text-sm transition-all"
                        />
                        {/* Quick presets */}
                        <div className="flex gap-2 mt-2">
                            {durationPresets.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTotalDuration(String(d))}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        totalDuration === String(d)
                                            ? 'bg-ayur-gold text-white border-ayur-gold'
                                            : 'bg-ayur-cream text-ayur-charcoal border-transparent hover:border-ayur-gold/30'
                                    }`}
                                >
                                    {d} Days
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Checkup Interval ───────────────────── */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-ayur-charcoal/50 uppercase tracking-widest mb-3">
                            <Clock size={13} />
                            Checkup Interval (Every X Days)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={intervalDays}
                            onChange={e => setIntervalDays(e.target.value)}
                            placeholder="e.g. 7 or 10"
                            className="w-full px-4 py-3 rounded-2xl bg-ayur-cream border-2 border-transparent focus:border-ayur-gold/50 focus:outline-none focus:ring-4 focus:ring-ayur-gold/10 text-ayur-charcoal font-sans text-sm transition-all"
                        />
                        {/* Quick presets */}
                        <div className="flex gap-2 mt-2">
                            {intervalPresets.map(i => (
                                <button
                                    key={i}
                                    onClick={() => setIntervalDays(String(i))}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        intervalDays === String(i)
                                            ? 'bg-ayur-green text-white border-ayur-green'
                                            : 'bg-ayur-cream text-ayur-charcoal border-transparent hover:border-ayur-gold/30'
                                    }`}
                                >
                                    Every {i}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Error ────────────────────────────────── */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-red-500 text-sm"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Success Result ───────────────────────── */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 space-y-1"
                            >
                                <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-2">
                                    <CheckCircle size={16} />
                                    Plan Saved Successfully!
                                </div>
                                <p className="text-xs text-ayur-charcoal/70 font-sans">
                                    Next Checkup: <span className="font-bold text-ayur-green">{result.nextCheckupDate}</span>
                                </p>
                                <p className="text-xs text-ayur-charcoal/70 font-sans">
                                    Plan Ends On: <span className="font-bold text-ayur-green">{result.endDate}</span>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Save Button ──────────────────────────── */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 rounded-2xl bg-ayur-green text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {saving ? 'Saving Plan...' : 'Save Plan'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TreatmentPlanner;
