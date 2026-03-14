import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Calendar,
    Bell,
    LineChart,
    Menu,
    X,
    Leaf,
    Settings,
    User,
    Users,
    Stethoscope,
    LogOut,
    MessageSquare,
    ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTherapy } from '../context/TherapyContext'
import LogoutModal from './LogoutModal'

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const { user, logout } = useTherapy()

    const patientItems = [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
        { id: 'schedule', label: 'My Plan', icon: Calendar, path: '/patient/my-plan' },
        { id: 'notifications', label: 'Precautions', icon: Bell, path: '/patient/notifications' },
        { id: 'ai-chat', label: 'AI Ayur-Mitra', icon: MessageSquare, path: '/patient/ai-chat' },
    ]

    const adminItems = [
        { id: 'dashboard', label: 'Admin Terminal', icon: ShieldCheck, path: '/admin/dashboard' },
        { id: 'templates', label: 'Global Protocols', icon: MessageSquare, path: '/admin/templates' }
    ]

    const doctorItems = [
        { id: 'dashboard', label: 'Practice Overview', icon: Stethoscope, path: '/doctor/dashboard' },
        { id: 'patients', label: 'Patient List', icon: Users, path: '/doctor/patients' },
        { id: 'scheduler', label: 'Treatment Planner', icon: Calendar, path: '/doctor/schedule' },
        { id: 'templates', label: 'Treatment Master', icon: MessageSquare, path: '/doctor/templates' },
        { id: 'analytics', label: 'Clinical Stats', icon: LineChart, path: '/doctor/analytics' },
    ]

    const userRole = user?.role?.toLowerCase();
    const menuItems = userRole === 'admin' ? adminItems : (userRole === 'doctor' ? doctorItems : patientItems)

    return (
        <>
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-ayur-green text-white rounded-xl shadow-lg"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-ayur-green text-ayur-cream shadow-2xl flex flex-col"
                    >
                        <div className="p-8 flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                                <Leaf className="text-ayur-gold" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-serif font-bold tracking-tight text-white">AyurSutra</h1>
                                <p className="text-[10px] text-ayur-gold font-bold uppercase tracking-[0.2em]">Management Suite</p>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-ayur-gold flex items-center justify-center text-ayur-green font-bold">
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">{user?.name}</p>
                                    <p className="text-[10px] opacity-50 uppercase tracking-widest">{user?.role}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="flex-1 px-4 py-4 space-y-2">
                            <p className="px-4 text-[10px] font-bold text-ayur-gold/40 uppercase tracking-widest mb-2">Main Menu</p>
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative
                                        ${isActive
                                            ? 'bg-[#2D5A27] text-[#D4AF37] font-bold shadow-lg scale-[1.02] border-l-4 border-[#D4AF37] rounded-l-none'
                                            : 'hover:bg-white/5 text-[#FDFBF7]/60'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-nav"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#D4AF37] rounded-r-full"
                                                />
                                            )}
                                            <item.icon size={20} className={isActive ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'} />
                                            <span className="font-sans text-sm">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-white/5 space-y-1">
                            <button className="w-full flex items-center gap-4 px-4 py-3 text-ayur-cream/40 hover:text-ayur-gold transition-colors font-sans text-sm">
                                <Settings size={18} />
                                <span>Account Settings</span>
                            </button>
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="w-full flex items-center gap-4 px-4 py-3 text-red-300/60 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all duration-300 group font-sans text-sm"
                            >
                                <motion.div
                                    whileHover={{ rotate: -15, scale: 1.1 }}
                                    className="p-2 rounded-lg group-hover:bg-red-500/10"
                                >
                                    <LogOut size={18} />
                                </motion.div>
                                <span className="font-bold">Logout</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={logout}
            />
        </>
    )
}

export default Sidebar
