import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTherapy } from '../../context/TherapyContext';
import {
    Users,
    Activity,
    Calendar,
    AlertCircle,
    Search,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Plus
} from 'lucide-react';
import PatientTable from './PatientTable';
import AggregateAnalytics from './AggregateAnalytics';
import SmartScheduler from './SmartScheduler';
import AddPatientModal from './AddPatientModal';

const DoctorDashboard = () => {
    const { user, patients } = useTherapy();
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

    const stats = [
        { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Active Treatments', value: 12, icon: Activity, color: 'text-ayur-green', bg: 'bg-green-50' },
        { label: 'Scheduled Today', value: 5, icon: Calendar, color: 'text-ayur-gold', bg: 'bg-yellow-50' },
        { label: 'Pending Feedback', value: 8, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-16"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-5xl font-serif font-bold text-ayur-green tracking-tight">Practice Dashboard</h1>
                    <p className="text-ayur-charcoal/50 font-sans mt-1">
                        Welcome back, Dr. Sharma. You have <span className="text-ayur-green font-bold">5 reviews</span> pending for today.
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setIsAddPatientOpen(true)}
                        className="bg-white text-ayur-green border-2 border-ayur-green/20 px-6 py-4 rounded-2xl font-bold font-sans hover:bg-ayur-green hover:text-white transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={20} />
                        Add New Patient
                    </button>
                    <button
                        onClick={() => setIsSchedulerOpen(true)}
                        className="bg-ayur-green text-white px-8 py-4 rounded-2xl font-bold font-sans shadow-xl hover:bg-ayur-green/90 transition-all flex items-center gap-2"
                    >
                        <Calendar size={20} />
                        Smart Scheduler
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-ayur-gold/10 group hover:border-ayur-gold/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <ArrowUpRight className="text-ayur-charcoal/20 group-hover:text-ayur-gold transition-colors" size={20} />
                        </div>
                        <p className="text-ayur-charcoal/40 font-sans text-xs uppercase tracking-widest font-bold">{stat.label}</p>
                        <h3 className="text-3xl font-serif font-bold text-ayur-green mt-1">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Patient Table Area */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-ayur-green">Active Treatments</h2>
                        <button className="text-ayur-gold font-bold text-sm hover:underline">View All Patients</button>
                    </div>
                    <PatientTable />
                </div>

                {/* Analytics Area */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-ayur-green">Recovery Indices</h2>
                    <AggregateAnalytics />

                    {/* Activity Feed */}
                    <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-ayur-gold/10 shadow-xl mt-6">
                        <h3 className="font-serif font-bold text-ayur-green mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[
                                { user: 'Rajesh K.', action: 'logged morning Vamana feedback', time: '10m ago', icon: CheckCircle2, color: 'text-green-500' },
                                { user: 'Priya S.', action: 'appointment rescheduled to 04:30 PM', time: '45m ago', icon: Clock, color: 'text-ayur-gold' },
                                { user: 'Amit P.', action: 'pre-procedure fast started', time: '2h ago', icon: AlertCircle, color: 'text-orange-500' },
                            ].map((act, i) => (
                                <div key={i} className="flex gap-4 items-start border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                                    <div className={`mt-1 flex-shrink-0 ${act.color}`}>
                                        <act.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-sans leading-relaxed"><span className="font-bold text-ayur-green">{act.user}</span> {act.action}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSchedulerOpen && (
                    <SmartScheduler isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
                )}
                {isAddPatientOpen && (
                    <AddPatientModal 
                        isOpen={isAddPatientOpen} 
                        onClose={() => setIsAddPatientOpen(false)}
                        onSuccess={() => {
                            setIsAddPatientOpen(false);
                            // Reload the page to refresh the patient list
                            window.location.reload();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DoctorDashboard;
