import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTherapy } from '../../context/TherapyContext';
import { MoreVertical, ExternalLink, Trash2, X, AlertCircle, Phone, Edit, Loader, CalendarDays, FileText, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditPatientModal from './EditPatientModal';
import TreatmentPlanner from './TreatmentPlanner';
import TreatmentModal from './TreatmentModal';
import { Plus } from 'lucide-react';

const PatientTable = () => {
    const { deletePatient } = useTherapy();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [patientToEdit, setPatientToEdit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [callingPatientId, setCallingPatientId] = useState(null);       // AI health interview call
    const [reminderCallingId, setReminderCallingId] = useState(null);     // treatment reminder call
    const [planningPatient, setPlanningPatient]   = useState(null);
    const [treatmentModalPatient, setTreatmentModalPatient] = useState(null);
    const [downloadingReportId, setDownloadingReportId] = useState(null);

    // 🛠️ Fetch Patients from Backend
    useEffect(() => {
        const fetchMyPatients = async () => {
            try {
                const { default: api } = await import('../../api/axiosConfig');
                const res = await api.get('/doctor/patients');
                setPatients(res.data);
            } catch (error) {
                console.error("Failed to fetch doctor's patients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPatients();
    }, []);

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleDeleteClick = (patient) => {
        setPatientToDelete(patient);
        setOpenDropdownId(null);
    };

    const handleEditClick = (patient) => {
        setPatientToEdit(patient);
        setOpenDropdownId(null);
    };

    const handleSaveEdit = (id, updatedData) => {
        setPatients(patients.map(p => p.id === id ? { ...p, ...updatedData } : p));
        setPatientToEdit(null);
    };

    // 🛠️ Final Delete Logic with Backend Sync
    const confirmDelete = async () => {
        if (patientToDelete) {
            try {
                const { default: api } = await import('../../api/axiosConfig');
                // Backend call
                await api.delete(`/doctor/patients/${patientToDelete.id}`);

                // Context and Local State Update
                deletePatient(patientToDelete.id);
                setPatients(patients.filter(p => p.id !== patientToDelete.id));

                setPatientToDelete(null);
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Could not delete patient. Check backend logs!");
            }
        }
    };

    // 🤖 Trigger AI Health Interview Call (asks patient health questions)
    const handleTriggerCall = async (patient, e) => {
        e.stopPropagation();
        if (callingPatientId === patient.id) return;
        setCallingPatientId(patient.id);
        const { default: toast } = await import('react-hot-toast');
        const patientName = patient.user?.name || patient.name || 'Patient';
        toast.loading(`🤖 Connecting AI Interview to ${patientName}...`, { id: `call_${patient.id}` });
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.post(`/doctor/trigger-call/${patient.id}`);
            toast.success(`🤖 AI Health Interview Call Dialed!`, { id: `call_${patient.id}`, duration: 4000 });
        } catch (error) {
            console.error('Failed to trigger AI call:', error);
            const msg = error.response?.data?.error || 'Failed to trigger AI call. Check Twilio settings.';
            toast.error(msg, { id: `call_${patient.id}` });
        } finally {
            setCallingPatientId(null);
        }
    };

    // 📞 Trigger Treatment Reminder Call (simple reminder message only)
    const handleTriggerReminder = async (patient, e) => {
        e.stopPropagation();
        if (reminderCallingId === patient.id) return;
        setReminderCallingId(patient.id);
        const { default: toast } = await import('react-hot-toast');
        const patientName = patient.user?.name || patient.name || 'Patient';
        toast.loading(`📞 Sending Reminder to ${patientName}...`, { id: `reminder_${patient.id}` });
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.post(`/doctor/trigger-reminder/${patient.id}`);
            toast.success(`📞 Reminder Call Sent!`, { id: `reminder_${patient.id}`, duration: 4000 });
        } catch (error) {
            console.error('Failed to trigger reminder:', error);
            const msg = error.response?.data?.error || 'Failed to trigger reminder call.';
            toast.error(msg, { id: `reminder_${patient.id}` });
        } finally {
            setReminderCallingId(null);
        }
    };

    // 📄 Download AI Health Report PDF
    const handleDownloadReport = async (patient, e) => {
        e.stopPropagation();
        if (downloadingReportId === patient.id) return;
        setDownloadingReportId(patient.id);
        const { default: toast } = await import('react-hot-toast');
        const patientName = patient.user?.name || patient.name || 'Patient';
        toast.loading(`Generating PDF for ${patientName}...`, { id: `pdf_${patient.id}` });
        try {
            const { default: api } = await import('../../api/axiosConfig');
            const response = await api.get(`/doctor/patients/${patient.id}/health-report/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HealthReport_${patientName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`📄 Health Report Downloaded!`, { id: `pdf_${patient.id}`, duration: 4000 });
        } catch (error) {
            console.error('Failed to download report:', error);
            const msg = error.response?.status === 404
                ? 'No health report yet. Make an AI call first!'
                : (error.response?.data?.error || 'Failed to download report.');
            toast.error(msg, { id: `pdf_${patient.id}` });
        } finally {
            setDownloadingReportId(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-20 text-ayur-green animate-pulse font-bold">
            Loading AyurSutra Records...
        </div>
    );

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-ayur-gold/10">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-ayur-cream border-b border-ayur-gold/10">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ayur-green/60">Patient Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ayur-green/60">Therapy</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ayur-green/60">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ayur-green/60">Recovery</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-ayur-green/60 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {!Array.isArray(patients) || patients.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-sans">
                                    No patients registered yet.
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => {
                                const name = patient.user?.name || patient.name || 'Unknown Patient';
                                const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'P';
                                const therapy = patient.currentTherapy || 'General Consultation';
                                const recovery = patient.recoveryProgress ?? 0;
                                const status = patient.status || 'Active';

                                return (
                                    <tr key={patient.id} onClick={(e) => { if (!e.target.closest('button')) navigate(`/doctor/patient/${patient.id}`) }} className="group hover:bg-ayur-cream/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-ayur-green/5 flex items-center justify-center text-ayur-green font-bold text-xs border border-ayur-green/10">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient?.id}`) }} className="text-sm font-bold text-ayur-green leading-tight hover:underline cursor-pointer text-left focus:outline-none">{name}</button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setTreatmentModalPatient(patient); }}
                                                            className="flex items-center justify-center p-1 rounded-full bg-ayur-gold/20 text-ayur-gold hover:bg-ayur-gold hover:text-white transition-all shadow-sm"
                                                            title="Add Treatment Note"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">{patient.user?.username || 'ID: Pending'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-sans text-ayur-charcoal">{therapy}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${recovery}%` }}
                                                        className="bg-ayur-gold h-full rounded-full"
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-ayur-green">{recovery}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className={`flex items-center justify-end gap-2 transition-opacity ${openDropdownId === patient?.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                {/* 📞 Treatment Reminder Call */}
                                                <button
                                                    onClick={(e) => handleTriggerReminder(patient, e)}
                                                    disabled={reminderCallingId === patient.id}
                                                    className={`p-2 rounded-lg border relative group transition-colors ${
                                                        reminderCallingId === patient.id
                                                            ? 'bg-orange-50 text-ayur-gold border-ayur-gold/20 cursor-not-allowed opacity-70'
                                                            : 'hover:bg-orange-50 text-ayur-gold border-transparent hover:border-ayur-gold/20'
                                                    }`}
                                                    title="Treatment Reminder Call"
                                                >
                                                    {reminderCallingId === patient.id
                                                        ? <Loader size={16} className="animate-spin" />
                                                        : <Phone size={16} />}
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                        {reminderCallingId === patient.id ? 'Calling...' : 'Reminder Call'}
                                                    </span>
                                                </button>
                                                {/* 🤖 AI Health Interview Call */}
                                                <button
                                                    onClick={(e) => handleTriggerCall(patient, e)}
                                                    disabled={callingPatientId === patient.id}
                                                    className={`p-2 rounded-lg border relative group transition-colors ${
                                                        callingPatientId === patient.id
                                                            ? 'bg-purple-50 text-purple-500 border-purple-200 cursor-not-allowed opacity-70'
                                                            : 'hover:bg-purple-50 text-purple-500 border-transparent hover:border-purple-200'
                                                    }`}
                                                    title="AI Health Interview Call"
                                                >
                                                    {callingPatientId === patient.id
                                                        ? <Loader size={16} className="animate-spin" />
                                                        : <Bot size={16} />}
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                        {callingPatientId === patient.id ? 'Interviewing...' : 'AI Interview'}
                                                    </span>
                                                </button>
                                                {/* 📄 Download Health Report PDF */}
                                                <button
                                                    onClick={(e) => handleDownloadReport(patient, e)}
                                                    disabled={downloadingReportId === patient.id}
                                                    className={`p-2 rounded-lg border relative group transition-colors ${
                                                        downloadingReportId === patient.id
                                                            ? 'bg-green-50 text-green-500 border-green-200 cursor-not-allowed opacity-70'
                                                            : 'hover:bg-green-50 text-green-500 border-transparent hover:border-green-200'
                                                    }`}
                                                    title="Download Health Report PDF"
                                                >
                                                    {downloadingReportId === patient.id
                                                        ? <Loader size={16} className="animate-spin" />
                                                        : <FileText size={16} />}
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                        {downloadingReportId === patient.id ? 'Generating...' : 'Health Report PDF'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setPlanningPatient(patient); }}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-400 border border-transparent hover:border-blue-200 relative group transition-colors"
                                                    title="Set Treatment Plan"
                                                >
                                                    <CalendarDays size={16} />
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Plan</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient?.id}`); }} className="p-2 hover:bg-white rounded-lg text-ayur-green border border-transparent hover:border-ayur-gold/20">
                                                    <ExternalLink size={16} />
                                                </button>
                                                <div className="relative">
                                                    <button onClick={(e) => toggleDropdown(e, patient?.id)} className="p-2 hover:bg-white rounded-lg text-ayur-green border border-transparent hover:border-ayur-gold/20">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openDropdownId === patient?.id && (
                                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-red-50 py-1 z-50">
                                                                <button onClick={(e) => { e.stopPropagation(); handleEditClick(patient); }} className="w-full px-4 py-3 flex items-center gap-3 text-ayur-charcoal hover:bg-ayur-cream transition-colors text-xs font-bold font-sans">
                                                                    <Edit size={14} /> Edit Record
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(patient); }} className="w-full px-4 py-3 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors text-xs font-bold font-sans">
                                                                    <Trash2 size={14} /> Delete Record
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🛠️ Delete Modal (No Changes Needed Here) */}
            <AnimatePresence>
                {patientToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPatientToDelete(null)} className="absolute inset-0 bg-ayur-charcoal/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-[2rem] shadow-2xl z-10 w-full max-w-md border border-red-100 relative">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-ayur-charcoal mb-2">Are you sure?</h2>
                            <p className="text-ayur-charcoal/60 text-sm mb-8">You are about to delete <b>{patientToDelete.user?.name || patientToDelete.name}</b>. This cannot be undone.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setPatientToDelete(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20">Delete Now</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🛠️ Edit Modal */}
            {patientToEdit && (
                <EditPatientModal 
                    patient={patientToEdit} 
                    onClose={() => setPatientToEdit(null)} 
                    onSave={handleSaveEdit} 
                />
            )}

            {/* 🗓️ Treatment Planner Modal */}
            <AnimatePresence>
                {planningPatient && (
                    <TreatmentPlanner
                        patient={planningPatient}
                        onClose={() => setPlanningPatient(null)}
                        onSaved={(id, data) => {
                            // Optionally update local patient state with new plan dates
                            setPatients(prev => prev.map(p =>
                                p.id === id ? { ...p, ...data } : p
                            ));
                        }}
                    />
                )}
            </AnimatePresence>

            {/* 📝 Treatment History Modal */}
            <TreatmentModal
                isOpen={!!treatmentModalPatient}
                onClose={() => setTreatmentModalPatient(null)}
                patientId={treatmentModalPatient?.id}
                patientName={treatmentModalPatient?.user?.name || treatmentModalPatient?.name}
                onTreatmentSaved={() => {
                    // Refresh not strictly required here if we fetch on detail view, but we can if want
                }}
            />
        </div>
    );
};

export default PatientTable;