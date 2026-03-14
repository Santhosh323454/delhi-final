import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, ChevronDown, Check } from 'lucide-react'

const ScheduleForm = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        therapyType: '',
        date: '',
        timeSlot: ''
    })

    const therapies = [
        "Vamana (Emesis)",
        "Virechana (Purgation)",
        "Basti (Enema)",
        "Nasya (Nasal Clearance)",
        "Raktamokshana (Blood-letting)"
    ]

    const timeSlots = ["08:30 AM", "10:30 AM", "02:30 PM", "04:30 PM"]

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-ayur-green/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-ayur-gold/20"
            >
                <div className="bg-ayur-green p-6 flex justify-between items-center text-ayur-cream">
                    <div>
                        <h2 className="text-2xl font-serif font-bold">Schedule Therapy</h2>
                        <p className="text-ayur-gold/80 text-sm">Personalize your healing session</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-8 space-y-6">
                    {/* Therapy Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-ayur-green uppercase tracking-wider">Therapy Type</label>
                        <div className="grid grid-cols-1 gap-3">
                            {therapies.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, therapyType: type })}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${formData.therapyType === type
                                            ? 'border-ayur-gold bg-ayur-gold/5 text-ayur-green'
                                            : 'border-gray-100 hover:border-ayur-gold/30'
                                        }`}
                                >
                                    <span className="font-sans font-medium">{type}</span>
                                    {formData.therapyType === type && <Check size={18} className="text-ayur-gold" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-ayur-green uppercase tracking-wider">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-ayur-gold" size={18} />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-3 bg-ayur-cream border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ayur-gold/50"
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Time Slot */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-ayur-green uppercase tracking-wider">Time Slot</label>
                            <select
                                className="w-full px-4 py-3 bg-ayur-cream border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ayur-gold/50 appearance-none"
                                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                            >
                                <option value="">Select Time</option>
                                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full bg-ayur-green text-ayur-cream py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-ayur-green/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        Confirm Appointment
                        <Check className="group-hover:scale-125 transition-transform" />
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default ScheduleForm
