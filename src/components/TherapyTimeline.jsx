import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Play } from 'lucide-react';

const TherapyTimeline = () => {
    const steps = [
        { id: 1, title: 'Purvakarma', desc: 'Snehana & Swedana (Oleation & Sudation)', status: 'completed' },
        { id: 2, title: 'Pradhanakarma', desc: 'Vamana (Clinical Emesis Therapy)', status: 'active' },
        { id: 3, title: 'Paschatkarma', desc: 'Samsarjana Krama (Dietary Protocol)', status: 'upcoming' },
    ];

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-ayur-gold/10">
            <h2 className="text-3xl font-serif font-bold text-ayur-green mb-10">Panchakarma Journey</h2>
            <div className="space-y-12">
                {steps.map((step, i) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-8 relative pb-2 group"
                    >
                        {/* Connecting Line */}
                        {i !== steps.length - 1 && (
                            <div className="absolute left-[23px] top-[50px] bottom-[-50px] w-1 bg-ayur-cream flex items-center justify-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: step.status === 'completed' ? '100%' : '0%' }}
                                    className="w-full bg-ayur-gold rounded-full"
                                />
                            </div>
                        )}

                        {/* Icon Node */}
                        <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${step.status === 'completed' ? 'bg-ayur-gold text-white rotate-12' :
                                step.status === 'active' ? 'bg-ayur-green text-white ring-8 ring-ayur-green/10 animate-pulse' :
                                    'bg-ayur-cream text-ayur-charcoal/30'
                            }`}>
                            {step.status === 'completed' ? <Check size={20} /> :
                                step.status === 'active' ? <Play size={20} className="fill-current" /> :
                                    <Clock size={20} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h4 className={`text-xl font-serif font-bold ${step.status === 'active' ? 'text-ayur-green' : 'text-ayur-charcoal/60'
                                }`}>
                                {step.title}
                            </h4>
                            <p className="text-sm font-sans text-ayur-charcoal/40 mt-1 leading-relaxed">
                                {step.desc}
                            </p>
                            {step.status === 'active' && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '40px' }}
                                    className="h-1 bg-ayur-gold mt-4 rounded-full"
                                />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TherapyTimeline;
