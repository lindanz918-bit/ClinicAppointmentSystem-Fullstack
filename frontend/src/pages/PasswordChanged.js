import React from 'react';
import { Link } from 'react-router-dom';

function PasswordChanged({ user }) {
  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6 col-lg-5 text-center">
        <div className="card shadow-sm border-0 p-4">
          <div className="card-body">
            <div className="mb-3 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>
            <h3 className="fw-bold">Password Updated!</h3>
            <p className="text-muted mt-2">Your password has been changed successfully.</p>
            <Link
              to={user?.doctor ? '/doctor/dashboard' : '/my-bookings'}
              className="btn btn-outline-secondary mt-3"
            >
              {user?.doctor ? 'Back to My Dashboard' : 'Back to My Bookings'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordChanged;