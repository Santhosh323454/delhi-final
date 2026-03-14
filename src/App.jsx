import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import DoctorDashboard from './components/Doctor/DoctorDashboard'
import LoginPage from './components/LoginPage'
import AyurMitra from './components/AyurMitra'
import TherapyTimeline from './components/TherapyTimeline'
import NotificationPanel from './components/NotificationPanel'
import PatientTable from './components/Doctor/PatientTable'
import PatientDetailView from './components/Doctor/PatientDetailView'
import AggregateAnalytics from './components/Doctor/AggregateAnalytics'
import SmartScheduler from './components/Doctor/SmartScheduler'
import TreatmentMaster from './components/Doctor/TreatmentMaster'
import AdminDashboard from './components/Admin/AdminDashboard'
import { useTherapy } from './context/TherapyContext'

function App() {
    const { user } = useTherapy();

    if (!user) {
        return (
            <>
                <Toaster position="top-right" />
                <LoginPage />
            </>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Default redirect based on role */}
                    <Route index element={<Navigate to={user.role === 'admin' ? "/admin/dashboard" : user.role === 'doctor' ? "/doctor/patients" : "/patient/my-plan"} replace />} />

                    {/* Admin Routes */}
                    <Route path="admin">
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="templates" element={<TreatmentMaster />} />
                    </Route>

                    {/* Doctor Routes */}
                    <Route path="doctor">
                        <Route path="dashboard" element={<DoctorDashboard />} />
                        <Route path="patients" element={<PatientTable />} />
                        <Route path="patient/:id" element={<PatientDetailView />} />
                        <Route path="schedule" element={<SmartScheduler />} />
                        <Route path="analytics" element={<AggregateAnalytics />} />
                        <Route path="templates" element={<TreatmentMaster />} />
                    </Route>

                    {/* Patient Routes */}
                    <Route path="patient">
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="my-plan" element={<TherapyTimeline />} />
                        <Route path="notifications" element={<NotificationPanel />} />
                        <Route path="ai-chat" element={<AyurMitra isPage={true} />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
