import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, User, Key, X } from 'lucide-react';

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
    const [therapies, setTherapies] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        currentTherapy: '',
        prakriti: 'General'
    });
    const [credentials, setCredentials] = useState(null); // { username, password, name }
    const [copied, setCopied] = useState(null); // 'id' | 'pass'

    useEffect(() => {
        if (isOpen) {
            import('../../api/axiosConfig').then(({ default: api }) => {
                api.get('/protocols/list')
                    .then(res => {
                        console.log('Admin Protocol List:', res.data);
                        setTherapies(res.data.map(item => typeof item === 'object' ? item.therapyName : item));
                    })
                    .catch(err => {
                        console.error("Error fetching therapies:", err);
                        setTherapies([]);
                    });
            });
        } else {
            // Reset everything when closed
            setCredentials(null);
            setFormData({ fullName: '', email: '', phoneNumber: '', currentTherapy: '', prakriti: 'General' });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.currentTherapy) {
            alert("Please select a treatment!");
            return;
        }
        try {
            const { default: api } = await import('../../api/axiosConfig');
            const payload = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phoneNumber,
                currentTherapy: formData.currentTherapy,
                prakriti: formData.prakriti
            };
            console.log("Sending Data:", payload);

            const res = await api.post('/doctor/add-patient', payload);
            // Backend returns: { id, username, password, name, currentTherapy }
            setCredentials({
                username: res.data.username,
                password: res.data.password,
                name: res.data.name || formData.fullName
            });
        } catch (error) {
            console.error("Error details:", error.response?.data);
            const errMsg = error.response?.data?.error || "Registration failed! Check the backend logs.";
            alert("Error: " + errMsg);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const handleDone = () => {
        if (onSuccess) onSuccess();
        onClose();
    };

    if (!isOpen) return null;

    // ── CREDENTIALS VIEW ─────────────────────────────────────────────────────
    if (credentials) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-[#FCF9F1] rounded-3xl w-full max-w-md p-8 shadow-2xl border-2 border-[#2D5A27] text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={36} />
                    </div>
                    <h2 className="text-[#2D5A27] text-2xl font-bold mb-1">Patient Registered!</h2>
                    <p className="text-[#8B7336] text-sm mb-6">
                        Share these credentials with <strong>{credentials.name}</strong>
                    </p>

                    {/* Login ID */}
                    <div className="bg-white border-2 border-[#2D5A27]/20 rounded-2xl p-4 mb-4 flex items-center gap-3">
                        <div className="bg-[#2D5A27]/10 p-2 rounded-xl">
                            <User size={20} className="text-[#2D5A27]" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-bold uppercase text-[#8B7336] tracking-widest">LOGIN ID</p>
                            <p className="text-[#2D5A27] font-bold text-lg font-mono">{credentials.username}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(credentials.username, 'id')}
                            className="p-2 rounded-xl hover:bg-[#2D5A27]/10 transition-colors"
                            title="Copy ID"
                        >
                            {copied === 'id' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} className="text-[#2D5A27]" />}
                        </button>
                    </div>

                    {/* Password */}
                    <div className="bg-white border-2 border-[#8B7336]/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
                        <div className="bg-[#8B7336]/10 p-2 rounded-xl">
                            <Key size={20} className="text-[#8B7336]" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[10px] font-bold uppercase text-[#8B7336] tracking-widest">PASSWORD</p>
                            <p className="text-[#2D5A27] font-bold text-lg font-mono tracking-widest">{credentials.password}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(credentials.password, 'pass')}
                            className="p-2 rounded-xl hover:bg-[#8B7336]/10 transition-colors"
                            title="Copy Password"
                        >
                            {copied === 'pass' ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} className="text-[#8B7336]" />}
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-6">⚠️ Save these credentials now — the password cannot be retrieved again.</p>

                    <button
                        onClick={handleDone}
                        className="w-full bg-[#2D5A27] text-white py-4 rounded-2xl font-bold hover:bg-[#23461E] shadow-lg transition-colors"
                    >
                        Done — Close &amp; Refresh
                    </button>
                </div>
            </div>
        );
    }

    // ── REGISTRATION FORM ────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FCF9F1] rounded-3xl w-full max-w-lg p-8 shadow-2xl relative border-2 border-[#2D5A27]">
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 text-2xl">
                    <X size={24} />
                </button>

                <h2 className="text-[#2D5A27] text-2xl font-bold mb-2">Register New Patient</h2>
                <p className="text-[#8B7336] text-sm mb-8">ADMIN DEFINED PROTOCOL SYNC</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#2D5A27] font-bold text-xs mb-2 uppercase">Full Name</label>
                        <input
                            type="text" required
                            className="w-full bg-white border border-[#E8E0C8] rounded-xl p-3 focus:outline-none focus:border-[#2D5A27]"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#2D5A27] font-bold text-xs mb-2 uppercase">Email Address</label>
                            <input
                                type="email" required
                                className="w-full bg-white border border-[#E8E0C8] rounded-xl p-3 focus:outline-none focus:border-[#2D5A27]"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[#2D5A27] font-bold text-xs mb-2 uppercase">Phone Number</label>
                            <input
                                type="text" required
                                className="w-full bg-white border border-[#E8E0C8] rounded-xl p-3 focus:outline-none focus:border-[#2D5A27]"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#2D5A27] font-bold text-xs mb-2 uppercase">Select Problem / Treatment</label>
                        <select
                            required
                            className="w-full bg-white border border-[#E8E0C8] rounded-xl p-3 focus:outline-none focus:border-[#2D5A27] cursor-pointer"
                            value={formData.currentTherapy}
                            onChange={(e) => setFormData({ ...formData, currentTherapy: e.target.value })}
                        >
                            <option value="">-- Choose Treatment --</option>
                            {therapies.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-white border border-[#E8E0C8] text-[#2D5A27] py-4 rounded-2xl font-bold hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="flex-1 bg-[#2D5A27] text-white py-4 rounded-2xl font-bold hover:bg-[#23461E] shadow-lg">Register &amp; Assign ID</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;