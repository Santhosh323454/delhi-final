import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, ChevronDown } from 'lucide-react';
import { useTherapy } from '../context/TherapyContext';

const AyurMitra = ({ isPage }) => {
    const { user, patients } = useTherapy();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const [language, setLanguage] = useState('English');

    // Get current patient data
    // user.id is set to the username (e.g. AS-2026-002) during login
    const patientUsername = user?.id || user?.username; // The patient's login ID
    const patientData = user?.role === 'patient'
        ? patients.find(p => p.id === user.id) || patients[0]
        : patients[0];

    const currentTherapy = patientData?.currentTherapy || 'Ayurvedic';

    useEffect(() => {
        if (messages.length > 0) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    role: 'bot',
                    content: `Namaste ${user?.name || 'Friend'}! I am Ayur-Mitra. I see you are currently undergoing ${currentTherapy}. How can I assist you with your recovery today?`
                }
            ]);
        }
    }, [isOpen]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const newMsgs = [...messages, { id: Date.now(), role: 'user', content: text }];
        setMessages(newMsgs);
        setInput('');
        setIsTyping(true);

        try {
            const { default: api } = await import('../api/axiosConfig');
            const res = await api.post('/chat/ask', {
                patientUsername: patientUsername, // e.g. AS-2026-002
                message: text,
                language: language
            });

            setMessages([...newMsgs, { id: Date.now() + 1, role: 'bot', content: res.data.reply }]);
        } catch (error) {
            console.error("AI Chat Error:", error.response?.data || error.message);
            const errMsg = error.response?.data?.error || 'Unable to reach AyurMitra right now. Please try again shortly.';
            setMessages([...newMsgs, { id: Date.now() + 1, role: 'bot', content: errMsg }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (user?.role === 'admin' || user?.role === 'doctor') return null;

    const chatContent = (
        <div className={`${isPage ? 'w-full h-full bg-white rounded-[3rem] shadow-xl border border-ayur-gold/10' : 'bg-white w-[400px] h-[600px] rounded-[3rem] shadow-2xl border border-ayur-gold/20'} flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className={`bg-ayur-green ${isPage ? 'p-10' : 'p-8'} flex justify-between items-center text-ayur-cream`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 relative">
                        <Bot className="text-ayur-gold" size={28} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-ayur-green" />
                    </div>
                    <div>
                        <h2 className={`${isPage ? 'text-2xl' : 'text-xl'} font-serif font-bold tracking-tight flex items-center gap-3`}>
                            Ayur-Mitra
                            <div className="flex bg-white/10 rounded-lg p-0.5 mt-0.5">
                                <button
                                    onClick={() => setLanguage('English')}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase transition-colors ${language === 'English' ? 'bg-ayur-gold text-white' : 'text-ayur-cream/50 hover:text-ayur-cream'}`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setLanguage('Tamil')}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase transition-colors ${language === 'Tamil' ? 'bg-ayur-gold text-white' : 'text-ayur-cream/50 hover:text-ayur-cream'}`}
                                >
                                    தமிழ்
                                </button>
                            </div>
                        </h2>
                        <p className="text-[10px] text-ayur-gold font-bold uppercase tracking-widest mt-1">AI Wellness Guide</p>
                    </div>
                </div>
                {!isPage && (
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronDown size={24} />
                    </button>
                )}
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-ayur-cream/30">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-sans shadow-sm ${m.role === 'user'
                            ? 'bg-ayur-gold text-white rounded-tr-none'
                            : 'bg-white text-ayur-green border border-ayur-gold/10 rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-ayur-gold/10 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-ayur-gold rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-ayur-gold rounded-full animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 bg-ayur-gold rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
                {['Food rules?', 'Next steps?', 'Felt dizzy', 'How to rest?'].map(reply => (
                    <button
                        key={reply}
                        onClick={() => handleSend(reply)}
                        className="px-4 py-2 bg-white border border-ayur-gold/20 rounded-full text-xs font-bold text-ayur-green hover:bg-ayur-gold hover:text-white transition-all shadow-sm"
                    >
                        {reply}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-ayur-gold/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your therapy..."
                        className="flex-1 bg-ayur-cream px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ayur-gold/50 text-sm font-sans"
                    />
                    <button
                        onClick={() => handleSend()}
                        className="bg-ayur-green text-white p-4 rounded-2xl hover:bg-ayur-green/90 transition-all shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );

    if (isPage) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-[calc(100vh-12rem)]"
            >
                {chatContent}
            </motion.div>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        className="mb-6"
                    >
                        {chatContent}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-ayur-green text-ayur-cream p-5 rounded-full shadow-2xl relative group border-4 border-white"
            >
                <Sparkles className="absolute -top-2 -left-2 text-ayur-gold group-hover:animate-spin" size={20} />
                {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
            </motion.button>
        </div>
    );
};

export default AyurMitra;
