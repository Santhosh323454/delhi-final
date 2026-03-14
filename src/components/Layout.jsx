import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'

const Layout = () => {
    const location = useLocation()

    return (
        <div className="flex min-h-screen bg-ayur-cream overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-8 relative">
                <div className="max-w-7xl mx-auto h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default Layout
