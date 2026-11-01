import React, {useState} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
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

function App() {
    // use null to simulate unlogged, use real login later
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        setUser(null);
        // call logout api
    };

    return (
        <Router>
            <div className="bg-light min-vh-100">
                <Navbar user={user} onLogout={handleLogout}/>
                <div className="container mb-5">
                    <Routes>
                        <Route path="/" element={<Home user={user}/>}/>
                        {/* add routers here */}
                        <Route path="/login" element={<Login setUser={setUser}/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/change-password" element={<ChangePassword user={user}/>}/>
                        <Route path="/password-changed" element={<PasswordChanged user={user}/>}/>
                        <Route path="/admin/bookings" element={<AdminBookingList/>}/>
                        <Route path="/admin/doctors" element={<AdminDoctorList/>}/>
                        <Route path="/admin/doctors/add" element={<AdminDoctorForm/>}/>
                        <Route path="/admin/doctors/edit/:id" element={<AdminDoctorForm/>}/>
                        <Route path="/login" element={<div>Login Page (coming soon)</div>}/>
                        <Route path="/register" element={<div>Register Page (coming soon)</div>}/>
                        <Route path="/available-slots" element={<div>Available Slots (coming soon)</div>}/>
                        <Route path="/my-bookings" element={<div>My Bookings (coming soon)</div>}/>
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;