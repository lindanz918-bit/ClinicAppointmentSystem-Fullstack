import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './App.css';
import AdminBookingList from "./pages/AdminBookingList";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordChanged from "./pages/PasswordChanged";
import AdminDoctorList from "./pages/AdminDoctorList";
import AdminDoctorForm from "./pages/AdminDoctorForm";
import AdminSlotList from "./pages/AdminSlotList";
import AdminUserList from "./pages/AdminUserList";
import AdminSlotForm from "./pages/AdminSlotForm";
import AdminAddBooking from "./pages/AdminAddBooking";
import AdminEditBooking from "./pages/AdminEditBooking";
import AdminUserForm from "./pages/AdminUserForm";
import DoctorDashboard from "./pages/DoctorDashboard";
import {useEffect, useState} from "react";
import PatientBookingList from "./pages/PatientBookingList";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AvailableSlots from "./pages/AvailableSlots";
import PatientEditBooking from "./pages/PatientEditBooking";


function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        // if logged in and on home page, redirect based on role
        if (location.pathname === '/' && user) {
            if (user.is_staff || user.is_superuser) {
                navigate('/admin/bookings');
            } else if (user.doctor) {
                navigate('/doctor/dashboard');
            } else {
                navigate('/my-bookings');
            }
        }
    }, [user, location.pathname, navigate]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/auth/logout/`,
                {},
                {withCredentials: true}
            );
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar user={user} setUser={setUser} />
            <div className="container mb-5">
                <Routes>
                    <Route path="/" element={<Home user={user}/>}/>
                    <Route path="/login" element={<Login setUser={setUser}/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/change-password" element={<ChangePassword user={user}/>}/>
                    <Route path="/password-changed" element={<PasswordChanged user={user}/>}/>
                    <Route path="/admin/bookings" element={<AdminBookingList/>}/>
                    <Route path="/admin/bookings/add" element={<AdminAddBooking/>}/>
                    <Route path="/admin/bookings/edit/:id" element={<AdminEditBooking/>}/>

                    <Route path="/admin/doctors" element={<AdminDoctorList/>}/>
                    <Route path="/admin/doctors/add" element={<AdminDoctorForm/>}/>
                    <Route path="/admin/doctors/edit/:id" element={<AdminDoctorForm/>}/>

                    <Route path="/admin/slots" element={<AdminSlotList/>}/>
                    <Route path="/admin/slots/add" element={<AdminSlotForm/>}/>
                    <Route path="/admin/slots/edit/:id" element={<AdminSlotForm/>}/>

                    <Route path="/admin/users" element={<AdminUserList/>}/>
                    <Route path="/admin/users/add" element={<AdminUserForm/>}/>
                    <Route path="/admin/users/edit/:id" element={<AdminUserForm/>}/>

                    <Route path="/doctor/dashboard" element={<DoctorDashboard/>}/>

                    <Route path="/my-bookings" element={<PatientBookingList/>}/>
                    <Route path="/available-slots" element={<AvailableSlots />} />
                    <Route path="/my-bookings/edit/:id" element={<PatientEditBooking />} />

                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent/>
        </Router>
    );
}

export default App;