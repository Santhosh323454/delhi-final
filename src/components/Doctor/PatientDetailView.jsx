import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Calendar, Activity, ClipboardList, Clock, Edit2, X, Save, RefreshCw, FileText } from 'lucide-react';
import { useTherapy } from '../../context/TherapyContext';

const PatientDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { patients, masterTemplates, updatePatientOverride, deletePatient } = useTherapy();
    const [isEditingOverride, setIsEditingOverride] = useState(false);
    const [draftOverride, setDraftOverride] = useState({ dos: '', donts: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [fetchedProtocol, setFetchedProtocol] = useState(null);
    const [treatmentHistory, setTreatmentHistory] = useState([]);

    const patientFromContext = patients.find(p => p.id === parseInt(id) || p.id === id);
    const [patient, setPatient] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(true);

    // Always fetch latest from backend first to avoid ID collisions with hardcoded dummy data
    useEffect(() => {
        if (!id) return;

        setLoadingPatient(true);

        import('../../api/axiosConfig').then(({ default: api }) => {
            // Fetch Patient Details
            api.get('/doctor/patients')
                .then(res => {
                    const found = res.data.find(p => p.id === parseInt(id) || p.id === id);
                    if (found) {
                        setPatient(found);
                    } else {
                        // fallback to context patients (read at time of fetch, not via dependency)
                        const fallback = patients.find(p => p.id === parseInt(id) || p.id === id);
                        if (fallback) setPatient(fallback);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch patient:", err);
                    const fallback = patients.find(p => p.id === parseInt(id) || p.id === id);
                    if (fallback) setPatient(fallback);
                })
                .finally(() => setLoadingPatient(false));

            // Fetch Treatment History
            api.get(`/treatments/patient/${id}`)
                .then(res => {
                    if (Array.isArray(res.data)) setTreatmentHistory(res.data);
                    else setTreatmentHistory([]);
                })
                .catch(err => {
                    console.error("Failed to fetch treatment history:", err);
                    setTreatmentHistory([]);
                });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only re-run when the patient ID changes — do NOT add patients/patientFromContext here

    // Fetch protocol from backend when patient has a therapy not in local masterTemplates
    useEffect(() => {
        const therapyName = patient?.currentTherapy;
        if (!therapyName) return;
        // Only fetch from DB if masterTemplates doesn't already have it
        if (masterTemplates[therapyName]) {
            setFetchedProtocol(masterTemplates[therapyName]);
            return;
        }
        import('../../api/axiosConfig').then(({ default: api }) => {
            api.get(`/protocols/${encodeURIComponent(therapyName)}`)
                .then(res => {
                    if (res.data) setFetchedProtocol({ dos: res.data.dos || '', donts: res.data.donts || '' });
                })
                .catch(() => setFetchedProtocol(null));
        });
    }, [patient?.currentTherapy, masterTemplates]);

    // Update draft overrides when patient or templates load
    useEffect(() => {
        if (patient && isEditingOverride) {
            const rules = patient.overrideRules || fetchedProtocol || masterTemplates[patient.currentTherapy] || { dos: '', donts: '' };
            setDraftOverride({ dos: rules.dos || '', donts: rules.donts || '' });
        }
    }, [isEditingOverride, patient, masterTemplates, fetchedProtocol]);

    if (loadingPatient) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayur-green mb-4"></div>
                <h2 className="text-xl font-serif text-ayur-green">Loading Patient Details...</h2>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ayur-green mb-4"></div>
                <h2 className="text-xl font-serif text-ayur-green">Loading Patient Details...</h2>
                <p className="text-sm text-ayur-charcoal/60 mt-2">Or patient may not exist. If this takes too long,</p>
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="flex items-center gap-2 mt-6 px-6 py-2 bg-ayur-cream text-ayur-green rounded-full shadow-sm hover:bg-ayur-gold/20 transition-colors font-bold"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        );
    }

    const rules = patient.overrideRules || fetchedProtocol || masterTemplates[patient.currentTherapy] || { dos: 'No standard protocol defined.', donts: 'No standard protocol defined.' };
    const isOverridden = !!patient.overrideRules;

    const handleSaveOverride = () => {
        updatePatientOverride(patient.id, draftOverride);
        setIsEditingOverride(false);
    };

    const handleClearOverride = () => {
        updatePatientOverride(patient.id, null);
        setIsEditingOverride(false);
    };

    const handleDelete = async () => {
        try {
            const { default: api } = await import('../../api/axiosConfig');
            await api.delete(`/doctor/patients/${patient.id}`);
            deletePatient(patient.id);
            navigate('/doctor/patients');
        } catch (error) {
            console.error("Failed to delete patient:", error);
            alert("Failed to delete patient. Check backend connection.");
        }
    };

    const handleDownloadReport = async () => {
        try {
            const { default: api } = await import('../../api/axiosConfig');
            const { default: toast } = await import('react-hot-toast');
            toast.loading("Generating PDF...", { id: `pdf_${patient.id}` });
            
            const response = await api.get(`/doctor/patients/${patient.id}/health-report/pdf`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            const filename = `HealthReport_${(patient.name || patient.user?.name || 'Patient').replace(/\s+/g, '_')}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success("PDF Downloaded!", { id: `pdf_${patient.id}` });
        } catch (error) {
            console.error("Failed to download PDF:", error);
            const { default: toast } = await import('react-hot-toast');
            toast.error("Failed to download report. Ensure a call was completed.", { id: `pdf_${patient.id}` });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/doctor/patients')}
                        className="p-2 hover:bg-ayur-cream rounded-xl text-ayur-green transition-colors border border-transparent hover:border-ayur-gold/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-ayur-green">{patient.name || patient.user?.name || 'Unknown Patient'}</h1>
                        <p className="text-xs text-ayur-charcoal/60 font-sans uppercase tracking-widest mt-1">
                            PID: {patient.id} • {(patient.age || patient.user?.age) || 'N/A'}y • {(patient.gender || patient.user?.gender) || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`px-4 py-2 flex items-center rounded-xl text-xs font-bold uppercase tracking-wider border ${patient.status === 'Active'
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {patient.status}
                    </span>
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
                        title="Download latest AI Health Report"
                    >
                        <FileText size={16} /> Health Report PDF
                    </button>
                    <button
                        onClick={() => setIsDeleting(true)}
                        className="px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Delete Patient
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleting(false)} className="absolute inset-0 bg-ayur-charcoal/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-[2rem] shadow-2xl z-10 w-full max-w-md border border-red-100 relative">
                            <h2 className="text-2xl font-serif font-bold text-ayur-charcoal mb-2">Delete {(patient.name || patient.user?.name || 'Patient')}?</h2>
                            <p className="text-ayur-charcoal/60 text-sm mb-8">This action cannot be undone and will remove all associated treatment records.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20">Confirm Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact and Basic Info */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10 space-y-6">
                    <div className="flex items-center gap-3 mb-4 text-ayur-green border-b border-ayur-gold/10 pb-4">
                        <User size={20} className="text-ayur-gold" />
                        <h2 className="font-serif font-bold text-lg">Patient Profile</h2>
                    </div>

                    <div className="space-y-4 font-sans text-sm">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Email / Phone</p>
                            <p className="text-ayur-charcoal">{patient.email || patient.user?.email || 'N/A'}</p>
                            <p className="text-ayur-charcoal">{patient.phone || patient.user?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Prakriti (Constitution)</p>
                            <p className="text-ayur-green font-bold">{patient.prakriti || 'Not Assessed'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Primary Diagnosis</p>
                            <p className="text-ayur-charcoal">{patient.diagnosis || 'Pending Diagnosis'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-1">Assigned Therapist</p>
                            <p className="text-ayur-charcoal">{patient.therapist || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>

                {/* Treatment Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3 text-ayur-green">
                                <Activity size={20} className="text-ayur-gold" />
                                <h2 className="font-serif font-bold text-lg">Clinical Status</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/10">
                                <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-2">Current Therapy</p>
                                <p className="text-2xl font-serif font-bold text-ayur-green">{patient.currentTherapy || 'Consultation'}</p>
                            </div>
                            <div className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/10">
                                <p className="text-[10px] uppercase tracking-widest text-ayur-charcoal/40 font-bold mb-2">Recovery Progress</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-white h-2 rounded-full overflow-hidden border border-ayur-gold/10">
                                        <div
                                            className="bg-ayur-gold h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${patient.recovery || patient.recoveryProgress || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-ayur-green">{patient.recovery || patient.recoveryProgress || 0}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Protocol Instructions */}
                        <div className="border border-ayur-gold/20 rounded-2xl overflow-hidden">
                            <div className="bg-ayur-cream px-5 py-3 flex items-center justify-between border-b border-ayur-gold/20">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-ayur-green uppercase tracking-wider">
                                        Protocol Instructions
                                    </h3>
                                    {isOverridden && (
                                        <span className="bg-ayur-gold text-white text-[10px] px-2 py-0.5 rounded-full font-bold">OVERRIDDEN</span>
                                    )}
                                </div>
                                {!isEditingOverride && (
                                    <button
                                        onClick={() => setIsEditingOverride(true)}
                                        className="text-ayur-charcoal/40 hover:text-ayur-gold transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                                    >
                                        <Edit2 size={14} /> Customize
                                    </button>
                                )}
                            </div>

                            <div className="p-5">
                                {isEditingOverride ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-charcoal/40 uppercase tracking-widest mb-1 block">Dos (Enna pannanum)</label>
                                            <textarea
                                                className="w-full text-sm font-sans p-3 bg-white border border-ayur-gold/20 rounded-xl resize-none focus:outline-none focus:border-ayur-gold"
                                                rows="2"
                                                value={draftOverride.dos}
                                                onChange={(e) => setDraftOverride({ ...draftOverride, dos: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-ayur-charcoal/40 uppercase tracking-widest mb-1 block">Don'ts (Enna panna kudadhu)</label>
                                            <textarea
                                                className="w-full text-sm font-sans p-3 bg-white border border-ayur-gold/20 rounded-xl resize-none focus:outline-none focus:border-ayur-gold"
                                                rows="2"
                                                value={draftOverride.donts}
                                                onChange={(e) => setDraftOverride({ ...draftOverride, donts: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            {isOverridden && (
                                                <button
                                                    onClick={handleClearOverride}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw size={14} /> Reset to Master
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setIsEditingOverride(false)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-ayur-charcoal/60 hover:bg-ayur-charcoal/5 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveOverride}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-ayur-green text-white rounded-lg hover:bg-ayur-green/90 transition-colors shadow-sm"
                                            >
                                                <Save size={14} /> Save Override
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-ayur-cream border border-ayur-gold/10 rounded-xl h-fit">
                                                <Clock size={20} className="text-ayur-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-ayur-charcoal mb-1">Dos (Enna pannanum)</h4>
                                                <p className="text-xs text-ayur-charcoal/60 leading-relaxed whitespace-pre-wrap">{rules.dos}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-ayur-cream border border-ayur-gold/10 rounded-xl h-fit">
                                                <ClipboardList size={20} className="text-ayur-gold" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-ayur-charcoal mb-1">Don'ts (Enna panna kudadhu)</h4>
                                                <p className="text-xs text-ayur-charcoal/60 leading-relaxed whitespace-pre-wrap">{rules.donts}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Treatment History Timeline */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-ayur-gold/10">
                        <div className="flex items-center gap-3 mb-6 text-ayur-green">
                            <ClipboardList size={20} className="text-ayur-gold" />
                            <h2 className="font-serif font-bold text-lg">Treatment History</h2>
                        </div>
                        
                        {(!Array.isArray(treatmentHistory) || treatmentHistory.length === 0) ? (
                            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm font-bold text-gray-500">No treatment history available</p>
                                <p className="text-xs text-gray-400 mt-1">Visit notes will appear here once added in the dashboard.</p>
                            </div>
                        ) : (
                            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-ayur-gold/20">
                                {treatmentHistory.map((record, i) => {
                                    let dateStr = "Unknown Date";
                                    try {
                                        if (record.visitDate) {
                                            const d = new Date(record.visitDate);
                                            // Check if date is valid
                                            if (!isNaN(d.getTime())) {
                                                dateStr = d.toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                });
                                            }
                                        }
                                    } catch (e) {
                                        console.error("Date format error:", e);
                                    }
                                    
                                    return (
                                        <div key={record.id || i} className="relative">
                                            {/* ... */}
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-ayur-gold z-10 shadow-sm" />
                                            
                                            <div className="bg-ayur-cream p-5 rounded-2xl border border-ayur-gold/10 hover:border-ayur-gold/30 transition-colors">
                                                <div className="flex justify-between items-center mb-3 border-b border-ayur-gold/10 pb-3">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-ayur-green/60">
                                                        {dateStr}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-ayur-charcoal/40 bg-white px-2 py-1 rounded-md border border-gray-100">
                                                        Dr. {typeof record.doctorName === 'string' ? record.doctorName : 'Unknown'}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="text-[10px] uppercase font-bold text-ayur-gold tracking-widest mb-1">Treatment Method</h4>
                                                        <p className="text-sm font-bold text-ayur-charcoal whitespace-pre-wrap">{typeof record.treatmentMethod === 'string' ? record.treatmentMethod : JSON.stringify(record.treatmentMethod || '')}</p>
                                                    </div>
                                                    
                                                    {record.medicines && (
                                                        <div>
                                                            <h4 className="text-[10px] uppercase font-bold text-ayur-gold tracking-widest mb-1">Medicines / Tablets</h4>
                                                            <p className="text-sm text-ayur-charcoal whitespace-pre-wrap">{typeof record.medicines === 'string' ? record.medicines : JSON.stringify(record.medicines)}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {record.notes && (
                                                        <div className="bg-white/50 p-3 rounded-xl mt-2">
                                                            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Doctor Notes</h4>
                                                            <p className="text-xs text-gray-600 italic whitespace-pre-wrap">"{typeof record.notes === 'string' ? record.notes : JSON.stringify(record.notes)}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-ayur-green p-6 rounded-[2rem] shadow-sm text-white relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10">
                            <Calendar size={150} />
                        </div>
                        <h2 className="font-serif font-bold text-lg mb-2 relative z-10">Next Scheduled Session</h2>
                        <p className="text-sm text-ayur-cream/80 mb-6 relative z-10">Review logs and prepare for the upcoming clinical appointment.</p>
                        <button className="bg-ayur-gold text-ayur-green font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-white transition-colors relative z-10 shadow-lg">
                            Schedule Appointment
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 m-6 bg-red-50 border-2 border-red-200 rounded-3xl max-w-4xl mx-auto shadow-sm">
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                        <X className="text-red-500" /> Page Crashed (React Render Error)
                    </h2>
                    <p className="text-sm text-red-800 mb-4">Please copy this error and share it so we can fix the bug:</p>
                    <pre className="text-xs font-mono bg-white p-4 rounded-xl text-red-900 border border-red-100 overflow-x-auto whitespace-pre-wrap">
                        {this.state.error?.toString()}
                        <br />
                        {this.state.error?.stack}
                    </pre>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-md hover:bg-red-700 transition"
                    >
                        Try Reloading Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const SafePatientDetailView = (props) => (
    <ErrorBoundary>
        <PatientDetailView {...props} />
    </ErrorBoundary>
);

export default SafePatientDetailView;
