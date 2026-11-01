import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active text-white' : 'text-white-50';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">Piki Ora Medical</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                {user.is_staff || user.is_superuser ? (
                  // Admin
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/admin/bookings')}`} to="/admin/bookings">
                        All Patient Bookings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/admin/doctors')}`} to="/admin/doctors">
                        Manage Doctors
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/admin/slots')}`} to="/admin/slots">
                        Manage Slots
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/admin/users')}`} to="/admin/users">
                        Manage Users
                      </Link>
                    </li>
                  </>
                ) : user.doctor ? (
                  // Doctor
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/doctor/dashboard')}`} to="/doctor/dashboard">
                        Doctor Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/change-password')}`} to="/change-password">
                        Change Password
                      </Link>
                    </li>
                  </>
                ) : (
                  // Patient
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/my-bookings')}`} to="/my-bookings">
                        My Bookings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/available-slots')}`} to="/available-slots">
                        Available Slots
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link fw-bold me-3 ${isActive('/change-password')}`} to="/change-password">
                        Change Password
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <button onClick={onLogout} className="btn btn-link nav-link text-white-50 p-0 border-0">
                    Logout ({user.username})
                  </button>
                </li>
              </>
            ) : (
              // Not logged in
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-light text-primary ms-2 btn-sm px-3" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;