import React from 'react';
import { motion } from 'framer-motion';
import StatusCards from './StatusCards';
import TherapyTimeline from './TherapyTimeline';
import Analytics from './Analytics';
import NotificationPanel from './NotificationPanel';
import FeedbackModal from './FeedbackModal';
import { useTherapy } from '../context/TherapyContext';
import { Sparkles, Calendar } from 'lucide-react';

const Dashboard = () => {
    const { user } = useTherapy();
    const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-16"
        >
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-5xl font-serif font-bold text-ayur-green tracking-tight">Patient Console</h1>
                    <p className="text-ayur-charcoal/40 font-sans mt-2 flex items-center gap-2">
                        <Sparkles size={16} className="text-ayur-gold" />
                        Welcome back, <span className="font-bold text-ayur-green/80 italic">{user?.name}</span>. Your healing journey is progressing beautifully.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-ayur-gold/10">
                    <div className="p-3 bg-ayur-cream rounded-xl text-ayur-green">
                        <Calendar size={20} />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-bold text-ayur-gold opacity-60 uppercase tracking-widest">Today's Date</p>
                        <p className="text-sm font-sans font-bold text-ayur-green">March 09, 2026</p>
                    </div>
                </div>
            </header>

            <StatusCards />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    <Analytics />
                    <div className="bg-ayur-green/5 p-1 rounded-[3rem]">
                        <NotificationPanel />
                    </div>
                </div>
                <div className="space-y-10 flex flex-col">
                    <TherapyTimeline />
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="group w-full bg-ayur-green text-ayur-cream py-6 rounded-[2rem] font-bold text-lg shadow-2xl hover:bg-ayur-green/90 transition-all flex items-center justify-center gap-4 border border-transparent hover:border-ayur-gold/30"
                    >
                        How are you feeling?
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles className="text-ayur-gold" size={20} />
                        </motion.span>
                    </button>

                    <div className="bg-ayur-cream/70 backdrop-blur-md p-10 rounded-[3rem] border border-ayur-gold/20 flex-1">
                        <h3 className="font-serif font-bold text-ayur-green text-xl mb-4">Therapist Notes</h3>
                        <p className="text-sm font-sans text-ayur-charcoal/60 leading-relaxed italic">
                            "Patient is responding well to Vamana. Ensure evening dietary protocol is strictly followed. Next observation in 24 hours."
                        </p>
                        <p className="text-[10px] font-bold text-ayur-gold mt-4 uppercase tracking-widest">— Dr. Sharma</p>
                    </div>
                </div>
            </div>

            {isFeedbackOpen && (
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            )}
        </motion.div>
    );
};

export default Dashboard;
