import React, {useEffect, useState} from 'react';
import axios from 'axios';

function DoctorDashboard() {
    const [bookings, setBookings] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentModal, setCommentModal] = useState(null); // { booking, mode: 'view' | 'edit' }
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = () => {
        // get doctor info first
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/me/`)
            .then(docRes => {
                setDoctor(docRes.data);
            })
            .catch(() => {
                // if there is no /me/ port, then get info from booking
            });
        // get data from booking
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/?mine=doctor`)
            .then(res => {
                setBookings(res.data);
                if (res.data.length > 0) {
                    setDoctor(res.data[0].slot.doctor);
                }
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

    const openCommentModal = (booking, mode) => {
        setCommentModal({booking, mode});
        setCommentText(booking.doctor_comments || '');
    };

    const saveComment = async () => {
        try {
            await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/api/bookings/${commentModal.booking.id}/`,
                {doctor_comments: commentText},
                {withCredentials: true}
            );
            setCommentModal(null);
            fetchDashboard();
        } catch (err) {
            console.error(err);
            alert('Failed to save comment');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>
                    Doctor Dashboard
                    {doctor && ` - Dr. ${doctor.first_name} ${doctor.last_name}`}
                </h2>
                {doctor && (
                    <span className="badge bg-info text-dark fs-6">
            Specialization: {doctor.specialization || 'General'}
          </span>
                )}
            </div>

            <table className="table table-hover align-middle mb-0">
                <thead>
                <tr>
                    <th>Patient Name</th>
                    <th>Patient Email</th>
                    <th>Appointment Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Doctor Comments</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {bookings.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                            No appointments found for you.
                        </td>
                    </tr>
                ) : (
                    bookings.map(booking => {
                        const expired = isExpired(booking.slot.date, booking.slot.time);
                        return (
                            <tr key={booking.id}>
                                <td>
                                    <strong>
                                        {booking.patient.first_name} {booking.patient.last_name}
                                    </strong>
                                </td>
                                <td>{booking.patient.email || '--'}</td>
                                <td>{booking.slot.date}</td>
                                <td>{booking.slot.time.slice(0, 5)}</td>
                                <td>
                                    {expired ? (
                                        <span className="badge bg-secondary">Completed / Expired</span>
                                    ) : (
                                        <span className="badge bg-success">Upcoming</span>
                                    )}
                                </td>
                                <td>
                                    {booking.doctor_comments ? (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openCommentModal(booking, 'view')}
                                        >
                                            View Comments
                                        </button>
                                    ) : (
                                        <span className="text-muted small">No comments yet</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => openCommentModal(booking, 'edit')}
                                    >
                                        {booking.doctor_comments ? 'Edit Comment' : 'Add Comment'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>

            {/* Comment Modal */}
            {commentModal && (
                <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {commentModal.mode === 'view' ? 'Doctor Notes' : 'Doctor Comment'} - {commentModal.booking.patient.username}
                                </h5>
                                <button type="button" className="btn-close"
                                        onClick={() => setCommentModal(null)}></button>
                            </div>
                            <div className="modal-body">
                                {commentModal.mode === 'view' ? (
                                    <>
                                        <p className="text-muted small mb-2">
                                            Appointment: <strong>{commentModal.booking.slot.date} {commentModal.booking.slot.time.slice(0, 5)}</strong>
                                        </p>
                                        <div className="p-3 bg-light rounded border" style={{whiteSpace: 'pre-line'}}>
                                            {commentModal.booking.doctor_comments}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Comments / Notes:</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Enter advice or notes for the patient..."
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setCommentModal(null)}>
                                    {commentModal.mode === 'view' ? 'Close' : 'Cancel'}
                                </button>
                                {commentModal.mode === 'view' ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => openCommentModal(commentModal.booking, 'edit')}
                                    >
                                        Edit Comment
                                    </button>
                                ) : (
                                    <button className="btn btn-primary" onClick={saveComment}>
                                        Save Comment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorDashboard;