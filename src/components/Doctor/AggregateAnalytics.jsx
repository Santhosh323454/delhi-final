import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const AggregateAnalytics = () => {
    const data = [
        { week: 'W1', rate: 45 },
        { week: 'W2', rate: 52 },
        { week: 'W3', rate: 48 },
        { week: 'W4', rate: 61 },
        { week: 'W5', rate: 75 },
        { week: 'W6', rate: 82 },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl border border-ayur-gold/10"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-serif font-bold text-ayur-green">Clinic Recovery Index</h3>
                    <p className="text-xs text-gray-400 font-sans">Avg. health improvement across patients</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-ayur-green font-bold">
                        <TrendingUp size={16} />
                        <span>+12.5%</span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">vs last month</span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10 }} dy={10} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                backgroundColor: '#FFF'
                            }}
                            labelStyle={{ color: '#2D5A27', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="#D4AF37"
                            fillOpacity={1}
                            fill="url(#colorRate)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-ayur-cream p-4 rounded-2xl border border-ayur-gold/10">
                    <p className="text-[10px] text-ayur-charcoal/40 font-bold uppercase tracking-[0.2em] mb-1">Top Performer</p>
                    <p className="text-sm font-bold text-ayur-green font-serif">Vamana (Emesis)</p>
                    <p className="text-[10px] text-green-600 font-bold mt-1">92% Compliance</p>
                </div>
                <div className="bg-ayur-cream p-4 rounded-2xl border border-ayur-gold/10">
                    <p className="text-[10px] text-ayur-charcoal/40 font-bold uppercase tracking-[0.2em] mb-1">Active Alerts</p>
                    <p className="text-sm font-bold text-ayur-green font-serif">3 Patients</p>
                    <p className="text-[10px] text-orange-600 font-bold mt-1">Check Precautions</p>
                </div>
            </div>
        </motion.div>
    )
}

export default AggregateAnalytics
