import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PatientBookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/?mine=patient`)
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const isExpired = (date, time) => {
    const now = new Date();
    const slotDateTime = new Date(`${date}T${time}`);
    return slotDateTime < now;
  };

  const handleCancel = (id, isExpiredBooking) => {
    const message = isExpiredBooking
      ? 'Are you sure you want to delete this expired booking?'
      : 'Are you sure you want to cancel this appointment?';
    if (window.confirm(message)) {
      axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`)
        .then(() => fetchBookings())
        .catch(() => alert('Failed to cancel booking'));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Upcoming Bookings</h2>
        <Link to="/available-slots" className="btn btn-primary">+ Add New Booking</Link>
      </div>

      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor's Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">No bookings found.</td>
            </tr>
          ) : (
            bookings.map(booking => {
              const expired = isExpired(booking.slot.date, booking.slot.time);
              return (
                <tr key={booking.id}>
                  <td>
                    Dr. {booking.slot.doctor.first_name} {booking.slot.doctor.last_name}
                    <small className="text-muted"> @{booking.slot.doctor.username}</small>
                  </td>
                  <td>{booking.slot.date}</td>
                  <td>{booking.slot.time.slice(0, 5)}</td>
                  <td>
                    {booking.doctor_comments ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setViewModal(booking)}
                      >
                        View Comments
                      </button>
                    ) : (
                      <span className="text-muted small">No comments yet</span>
                    )}
                  </td>
                  <td>
                    {expired ? (
                      <>
                        <span className="badge bg-secondary me-1">Completed / Expired</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(booking.id, true)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-danger btn-sm me-1"
                          onClick={() => handleCancel(booking.id, false)}
                        >
                          Cancel
                        </button>
                        <Link
                          to={`/my-bookings/edit/${booking.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Edit
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* View Comments Modal */}
      {viewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Doctor Comments</h5>
                <button type="button" className="btn-close" onClick={() => setViewModal(null)}></button>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewModal.doctor_comments}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientBookingList;