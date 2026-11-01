import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div>
      {/* Welcome Section */}
      <div className="py-5 text-center bg-light rounded-3 mb-4 shadow-sm">
        <div className="container py-4">
          <h1 className="display-4 fw-bold text-primary mb-3">
            Welcome to Piki Ora Medical
          </h1>
          <p className="col-md-8 fs-5 text-muted mx-auto mb-4">
            Book appointment slots with our healthcare professionals easily and securely.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            {user ? (
              <Link to="/available-slots" className="btn btn-primary btn-lg px-4 gap-3">
                Book Appointment
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg px-4 me-sm-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="row g-4 py-3 text-center">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <h4 className="card-title text-primary fw-bold">Easy Scheduling</h4>
              <p className="card-text text-muted">
                Browse available time slots across all general practitioners and specialists in real time.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <h4 className="card-title text-primary fw-bold">Doctor Portal</h4>
              <p className="card-text text-muted">
                Doctors can view upcoming bookings, and leave patient notes seamlessly.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-3">
            <div className="card-body">
              <h4 className="card-title text-primary fw-bold">Patient Records</h4>
              <p className="card-text text-muted">
                Track your booking history, view doctor feedback, and manage existing appointments easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;