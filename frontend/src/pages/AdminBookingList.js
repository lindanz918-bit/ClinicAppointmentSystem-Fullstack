import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminBookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/`)
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`)
        .then(() => fetchBookings())
        .catch(err => alert('Failed to cancel booking'));
    }
  };

  const isExpired = (date, time) => {
    const now = new Date();
    const slotDateTime = new Date(`${date}T${time}`);
    return slotDateTime < now;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Active Bookings</h2>
        <Link to="/admin/bookings/add" className="btn btn-primary">+ Add New Booking</Link>
      </div>

      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Patient Name</th>
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
              <td colSpan="6" className="text-center">No bookings found.</td>
            </tr>
          ) : (
            bookings.map(booking => {
              const expired = isExpired(booking.slot.date, booking.slot.time);
              return (
                <tr key={booking.id}>
                  <td className="ps-4">
                    <div className="fw-bold">
                      {booking.patient.first_name} {booking.patient.last_name}
                    </div>
                    <small className="text-muted">@{booking.patient.username}</small>
                  </td>
                  <td className="ps-4">
                    <div className="fw-bold">
                      Dr. {booking.slot.doctor.first_name} {booking.slot.doctor.last_name}
                    </div>
                    <small className="text-muted">@{booking.slot.doctor.username}</small>
                  </td>
                  <td>{booking.slot.date}</td>
                  <td>{booking.slot.time}</td>
                  <td>
                    {booking.doctor_comments ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedComment(booking)}
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
                        <span className="badge bg-secondary me-2">Completed / Expired</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                        <Link
                          to={`/admin/bookings/edit/${booking.id}`}
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

      {/* Comment Modal */}
      {selectedComment && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Doctor Comments for {selectedComment.patient.username}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedComment(null)}></button>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedComment.doctor_comments}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedComment(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookingList;