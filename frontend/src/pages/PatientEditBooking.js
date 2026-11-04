import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

function PatientEditBooking() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async () => {
        try {
            const [bookingRes, docRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`),
                axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`),
            ]);
            const b = bookingRes.data;
            setBooking(b);
            setDoctors(docRes.data);
            setSelectedDoctor(b.slot.doctor.id);
            setSelectedSlot(b.slot.id);
            await loadSlots(b.slot.doctor.id, b.slot.id);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadSlots = async (doctorId, currentSlotId) => {
        // only get the unbooked slots
        const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/slots/?doctor=${doctorId}&is_booked=false`
        );
        let available = res.data;

        // if the current slot is not in the list, then add it in manually.
        if (currentSlotId) {
            const exists = available.some(s => s.id === parseInt(currentSlotId));
            if (!exists) {
                try {
                    const currentRes = await axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/api/slots/${currentSlotId}/`
                    );
                    // only the slot belongs to the current doctor
                    if (currentRes.data.doctor.id === parseInt(doctorId)) {
                        available = [currentRes.data, ...available];
                    }
                } catch (e) {
                    console.error('Failed to load current slot', e);
                }
            }
        }
        setSlots(available);
    };

    const handleDoctorChange = async (e) => {
        const doctorId = e.target.value;
        setSelectedDoctor(doctorId);
        setSelectedSlot('');
        if (doctorId) {
            await loadSlots(doctorId);
        } else {
            setSlots([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`, {
                slot_id: selectedSlot,
            });
            navigate('/my-bookings');
        } catch (err) {
            alert('Failed to update booking: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data)));
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!booking) return <div>Booking not found</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card shadow">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Edit Booking</h3>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Select Doctor */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">1. Select Doctor:</label>
                                <select
                                    className="form-select"
                                    value={selectedDoctor}
                                    onChange={handleDoctorChange}
                                >
                                    <option value="">-- Choose Doctor --</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            Dr. {doc.username} ({doc.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Select Slot */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">2. Select Time Slot:</label>
                                <select
                                    className="form-select"
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Time Slot --</option>
                                    {slots.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.date} at {s.time.slice(0, 5)}
                                            {parseInt(s.id) === booking.slot.id ? ' (Currently Booked)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => navigate('/my-bookings')}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientEditBooking;