import React, { createContext, useContext, useState, useEffect } from 'react';

const TherapyContext = createContext();

export const TherapyProvider = ({ children }) => {
    // Persistent User State
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('ayur_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Persistent Patients State
    const [patients, setPatients] = useState(() => {
        const savedPatients = localStorage.getItem('ayur_patients');
        return savedPatients ? JSON.parse(savedPatients) : [
            { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', prakriti: 'Pitham', status: 'Active', currentTherapy: 'Vamana', recovery: 65, therapist: 'Dr. Sharma', diagnosis: 'Chronic Gastritis' },
            { id: 2, name: 'Priya Singh', email: 'priya@example.com', phone: '9123456780', prakriti: 'Kapham', status: 'Active', currentTherapy: 'Basti', recovery: 40, therapist: 'Dr. Sharma', diagnosis: 'Joint Pain' },
            { id: 3, name: 'Amit Patel', email: 'amit@example.com', phone: '9988776655', prakriti: 'Vatham', status: 'Waitlist', currentTherapy: 'Nasya', recovery: 10, therapist: 'Dr. Varma', diagnosis: 'Sinusitis' },
        ];
    });

    // Persistent Templates State — seeded with hardcoded defaults, then merged with DB data
    const [masterTemplates, setMasterTemplates] = useState(() => {
        const savedTemplates = localStorage.getItem('ayur_templates');
        return savedTemplates ? JSON.parse(savedTemplates) : {
            Vamana: { dos: '12h Fasting Required', donts: 'Avoid Sun for 4h', icon: 'Utensils' },
            Basti: { dos: 'Light Meal 2h Before', donts: 'Walk slowly for 10m', icon: 'Droplets' },
            Virechana: { dos: 'Oil Intake for 3 days', donts: 'Drink warm water', icon: 'Glass' },
            Nasya: { dos: 'Face Massage', donts: 'Do not blow nose', icon: 'Wind' },
            Raktamokshana: { dos: 'Assess bleeding time', donts: 'Apply pressure and rest', icon: 'Activity' },
        };
    });

    // ── Load all protocols from DB and merge into masterTemplates ──────────────
    useEffect(() => {
        const loadProtocolsFromDB = async () => {
            try {
                const { default: api } = await import('../api/axiosConfig');
                // 1. Get list of all protocol names
                const listRes = await api.get('/protocols/list');
                const names = listRes.data || [];
                if (names.length === 0) return;

                // 2. Fetch each protocol's dos/donts and merge
                const fetched = await Promise.all(
                    names.map(name =>
                        api.get(`/protocols/${encodeURIComponent(name)}`)
                            .then(r => ({ name, dos: r.data.dos || '', donts: r.data.donts || '' }))
                            .catch(() => null)
                    )
                );

                const dbTemplates = {};
                fetched.forEach(item => {
                    if (item) {
                        dbTemplates[item.name] = { dos: item.dos, donts: item.donts };
                    }
                });

                // Merge DB templates into masterTemplates (DB takes precedence)
                setMasterTemplates(prev => ({ ...prev, ...dbTemplates }));
            } catch (err) {
                console.warn('Could not load protocols from DB:', err.message);
            }
        };

        loadProtocolsFromDB();
    }, []); // Run once on app start

    // Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem('ayur_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('ayur_patients', JSON.stringify(patients));
    }, [patients]);

    useEffect(() => {
        localStorage.setItem('ayur_templates', JSON.stringify(masterTemplates));
    }, [masterTemplates]);

    const updateMasterTemplate = (therapyName, newRules) => {
        setMasterTemplates(prev => ({
            ...prev,
            [therapyName]: { ...prev[therapyName], ...newRules }
        }));
    };

    const login = (userData) => {
        // userData from backend AuthResponse contains: token, username, role, message
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        setUser({
            id: userData.username,
            name: userData.username,
            role: userData.role.toLowerCase()
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ayur_user');
        localStorage.removeItem('token');
    };

    const addPatient = (patientInfo) => {
        const newPatient = {
            id: Date.now(),
            ...patientInfo,
            status: 'Active',
            currentTherapy: patientInfo.currentTherapy || 'Consulting',
            recovery: 0,
            therapist: 'Dr. Sharma',
            overrideRules: null // Patient-specific overrides
        };
        setPatients(prev => [...prev, newPatient]);
    };

    const deletePatient = (id) => {
        setPatients(prev => prev.filter(patient => patient.id !== id));
    };

    const updatePatientOverride = (patientId, newRules) => {
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, overrideRules: newRules } : p
        ));
    };

    return (
        <TherapyContext.Provider value={{
            user,
            patients,
            masterTemplates,
            login,
            logout,
            addPatient,
            deletePatient,
            setPatients,
            updateMasterTemplate,
            updatePatientOverride
        }}>
            {children}
        </TherapyContext.Provider>
    );
};

export const useTherapy = () => useContext(TherapyContext);
