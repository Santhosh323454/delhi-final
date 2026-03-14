import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingDown, Zap } from 'lucide-react'

const Analytics = () => {
    const lineData = [
        { day: 'Mon', level: 8 },
        { day: 'Tue', level: 7 },
        { day: 'Wed', level: 5 },
        { day: 'Thu', level: 6 },
        { day: 'Fri', level: 4 },
        { day: 'Sat', level: 3 },
        { day: 'Sun', level: 2 },
    ]

    const barData = [
        { session: 'S1', energy: 40 },
        { session: 'S2', energy: 55 },
        { session: 'S3', energy: 75 },
        { session: 'S4', energy: 65 },
        { session: 'S5', energy: 90 },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {/* Pain/Stress Level Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-ayur-gold/10"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-ayur-green">Pain Improvement</h3>
                        <p className="text-sm text-gray-500 font-sans">7-day trend analysis</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <TrendingDown size={24} />
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="level"
                                stroke="#D4AF37"
                                strokeWidth={4}
                                dot={{ r: 6, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8, fill: '#2D5A27' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Energy Level Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-ayur-gold/10"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-ayur-green">Energy Levels</h3>
                        <p className="text-sm text-gray-500 font-sans">Post-session feedback</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Zap size={24} />
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                            <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#FDFBF7' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="energy" radius={[6, 6, 0, 0]} barSize={40}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === barData.length - 1 ? '#2D5A27' : '#D4AF37'} opacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    )
}

export default Analytics
