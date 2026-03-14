import React from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useTherapy } from '../context/TherapyContext';

const NotificationPanel = () => {
    const { user, patients, masterTemplates } = useTherapy();

    const patientData = user?.role === 'patient'
        ? patients.find(p => p.id === user.id) || patients[0] || {}
        : patients[0] || {};

    const rules = (masterTemplates && masterTemplates[patientData.currentTherapy]) || (masterTemplates && masterTemplates['Vamana']) || { dos: '', donts: '' };

    const notifications = [
        {
            type: 'dos',
            title: 'Dos (Enna pannanum)',
            desc: rules.dos,
            time: 'Starts in 2h',
            icon: AlertCircle,
            color: 'bg-orange-50 border-orange-100 text-orange-800'
        },
        {
            type: 'donts',
            title: 'Don\'ts (Enna panna kudadhu)',
            desc: rules.donts,
            time: 'Next Session',
            icon: CheckCircle2,
            color: 'bg-green-50 border-green-100 text-green-800'
        }
    ];

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-ayur-gold/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-ayur-green">Treatment Guide</h2>
                    <p className="text-[10px] text-ayur-gold font-bold uppercase tracking-[0.2em] mt-2">Active protocol: {patientData.currentTherapy}</p>
                </div>
                <div className="p-4 bg-ayur-cream rounded-2xl">
                    <Sparkles className="text-ayur-gold" size={24} />
                </div>
            </div>

            <div className="space-y-6 flex-1">
                {notifications.map((note, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${note.color} p-6 rounded-[2rem] border flex gap-5`}
                    >
                        <div className="mt-1 flex-shrink-0">
                            <note.icon size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <p className="font-bold text-base tracking-tight">{note.title}</p>
                                <span className="text-[10px] opacity-40 uppercase font-bold tracking-widest whitespace-nowrap">• {note.time}</span>
                            </div>
                            <p className="text-sm opacity-80 font-sans leading-relaxed">{note.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-10 py-5 border-2 border-dashed border-ayur-gold/20 rounded-2xl text-ayur-charcoal/40 text-xs font-bold hover:border-ayur-gold/40 hover:text-ayur-green transition-all uppercase tracking-[0.3em]">
                Download Full Regimen PDF
            </button>
        </div>
    );
};

export default NotificationPanel;
