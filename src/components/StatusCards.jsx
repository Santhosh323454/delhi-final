import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Bell, ArrowUpRight } from 'lucide-react';
import { useTherapy } from '../context/TherapyContext';

const StatusCards = () => {
    const { user } = useTherapy();
    const [patientData, setPatientData] = useState({ currentTherapy: 'Consulting', recoveryProgress: 0 });

    useEffect(() => {
        // For patient role, fetch their own data from backend using their username
        if (user?.role === 'patient') {
            import('../api/axiosConfig').then(({ default: api }) => {
                api.get('/patient/me')
                    .then(res => {
                        if (res.data) setPatientData(res.data);
                    })
                    .catch(() => {
                        // Fallback: no-op; keep default
                    });
            });
        }
    }, [user]);

    const cards = [
        {
            title: 'Current Therapy',
            value: patientData.currentTherapy || 'Consulting',
            sub: 'Today at 04:30 PM',
            icon: Clock,
            color: 'bg-ayur-green/80 text-ayur-cream backdrop-blur-md',
        },
        {
            title: 'Pre-procedure Alert',
            value: 'Fasting Required',
            sub: 'Starts in 2 hours',
            icon: Bell,
            color: 'bg-ayur-gold/80 text-ayur-green backdrop-blur-md',
        },
        {
            title: 'Recovery Progress',
            value: `${patientData.recoveryProgress || 0}%`,
            sub: '+12% this week',
            icon: Activity,
            color: 'bg-white/70 text-ayur-green border border-ayur-gold/10 backdrop-blur-md',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${card.color} p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group h-72 relative overflow-hidden`}
                >
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-700" />

                    <div className="flex justify-between items-start z-10">
                        <div className={`p-4 rounded-2xl ${card.color.includes('bg-white') ? 'bg-ayur-cream' : 'bg-white/10'}`}>
                            <card.icon size={32} />
                        </div>
                        <ArrowUpRight className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>

                    <div className="z-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.3em] opacity-60 mb-3">{card.title}</h3>
                        <p className="text-5xl font-serif font-bold">{card.value}</p>
                        <p className="text-[10px] font-sans mt-3 opacity-50 font-bold uppercase tracking-widest leading-none">{card.sub}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatusCards;
