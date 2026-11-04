import React, {useEffect, useState} from 'react';
import axios from 'axios';

function AvailableSlots() {
    const [slots, setSlots] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        q: '',
        specialization: '',
        doctor_id: '',
        date: '',
    });
    const [doctorModal, setDoctorModal] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = () => {
        Promise.all([
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/slots/?is_booked=false`),
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`),
        ])
            .then(([slotRes, docRes]) => {
                setSlots(slotRes.data);
                setDoctors(docRes.data);
                // get specialization
                const specs = [...new Set(docRes.data.map(d => d.specialization).filter(Boolean))];
                setSpecializations(specs);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/slots/?is_booked=false`;
        if (filters.doctor_id) url += `&doctor=${filters.doctor_id}`;
        if (filters.date) url += `&date=${filters.date}`;
        axios.get(url)
            .then(res => {
                let filtered = res.data;

                // frontend filter by doctor name or username
                if (filters.q) {
                    const q = filters.q.toLowerCase();
                    filtered = filtered.filter(slot =>
                        slot.doctor.first_name.toLowerCase().includes(q) ||
                        slot.doctor.last_name.toLowerCase().includes(q) ||
                        slot.doctor.username.toLowerCase().includes(q)
                    );
                }

                // frontend filter specialization
                if (filters.specialization) {
                    filtered = filtered.filter(slot =>
                        slot.doctor.specialization === filters.specialization
                    );
                }

                setSlots(filtered);
            })
            .catch(console.error);
    };

    const handleReset = () => {
        setFilters({q: '', specialization: '', doctor_id: '', date: ''});
        fetchInitialData();
    };

    const handleBook = (slotId) => {
        if (window.confirm('Are you sure you want to book this slot?')) {
            axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/`, {
                slot_id: slotId,
            })
                .then(() => {
                    alert('Booking successful!');
                    fetchInitialData();
                })
                .catch(err => {
                    alert('Failed to book: ' + (err.response?.data?.detail || 'Please try again'));
                });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {/* Filter Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <form onSubmit={handleFilter} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-secondary small">Search Doctor</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search name, username..."
                                value={filters.q}
                                onChange={(e) => setFilters({...filters, q: e.target.value})}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold text-secondary small">Specialization</label>
                            <select
                                className="form-select"
                                value={filters.specialization}
                                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                            >
                                <option value="">All Specializations</option>
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-secondary small">Doctor</label>
                            <select
                                className="form-select"
                                value={filters.doctor_id}
                                onChange={(e) => setFilters({...filters, doctor_id: e.target.value})}
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.first_name} {doc.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold text-secondary small">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date}
                                onChange={(e) => setFilters({...filters, date: e.target.value})}
                            />
                        </div>
                        <div className="col-md-2 d-flex gap-2">
                            <button type="submit" className="btn btn-primary w-100 fw-bold">Filter</button>
                            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Slots Table */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>Doctor</th>
                            <th>Specialization</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th className="text-end pe-4">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {slots.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                    No available appointment slots found.
                                </td>
                            </tr>
                        ) : (
                            slots.map(slot => (
                                <tr key={slot.id}>
                                    <td>
                                        <button
                                            className="btn btn-link text-primary text-decoration-underline fw-bold p-0"
                                            onClick={() => setDoctorModal(slot.doctor)}
                                        >
                                            Dr. {slot.doctor.first_name} {slot.doctor.last_name}
                                        </button>
                                        <br/>
                                        <small className="text-muted">@{slot.doctor.username}</small>
                                    </td>
                                    <td>
                                        <span className="badge bg-info text-dark">{slot.doctor.specialization}</span>
                                    </td>
                                    <td>{slot.date}</td>
                                    <td>{slot.time.slice(0, 5)}</td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-success btn-sm px-3"
                                            onClick={() => handleBook(slot.id)}
                                        >
                                            Book Now
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Doctor Info Modal */}
            {doctorModal && (
                <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    Dr. {doctorModal.first_name} {doctorModal.last_name}
                                </h5>
                                <button type="button" className="btn-close btn-close-white"
                                        onClick={() => setDoctorModal(null)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <p className="mb-2">
                                    <strong>Specialization:</strong>{' '}
                                    <span className="badge bg-info text-dark">{doctorModal.specialization}</span>
                                </p>
                                {doctorModal.email &&
                                    <p className="mb-2"><strong>Email:</strong> {doctorModal.email}</p>}
                                {doctorModal.phone &&
                                    <p className="mb-2"><strong>Phone:</strong> {doctorModal.phone}</p>}
                                <hr/>
                                <h6 className="fw-bold">Professional Experience & Background:</h6>
                                <p className="text-muted" style={{whiteSpace: 'pre-line'}}>
                                    {doctorModal.experience || 'No experience details provided yet.'}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDoctorModal(null)}>Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AvailableSlots;