import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AdminEditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load current booking and doctors
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`),
    ])
      .then(([bookingRes, doctorRes]) => {
        const b = bookingRes.data;
        setBooking(b);
        setDoctors(doctorRes.data);
        setSelectedDoctor(b.slot.doctor.id);
        setSelectedSlot(b.slot.id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // load the slots when the doctor changed
  useEffect(() => {
    if (selectedDoctor) {
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/slots/?doctor=${selectedDoctor}`)
        .then(res => {
          // filter the unbooked and this slot id
          const available = res.data.filter(
            s => !s.is_booked || s.id === booking?.slot.id
          );
          setSlots(available);
        })
        .catch(err => console.error(err));
    }
  }, [selectedDoctor, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/${id}/`, {
        slot: selectedSlot,
      });
      navigate('/admin/bookings');
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div>
      <h2>Admin Edit Booking</h2>

      {/* Patient Display */}
      <div className="mb-3">
        <label className="form-label fw-bold">Patient:</label>
        <div>
          {booking.patient.first_name} {booking.patient.last_name} @{booking.patient.username}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Select Doctor */}
        <div className="mb-3">
          <label className="form-label fw-bold">1. Select Doctor:</label>
          <select
            className="form-select"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">-- Choose Doctor --</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                Dr. {d.first_name} {d.last_name} @{d.username} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        {/* Select Slot */}
        <div className="mb-3">
          <label className="form-label fw-bold">2. Select Available Slot:</label>
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
                {s.id === booking.slot.id ? ' (Currently Booked)' : ''}
              </option>
            ))}
            {slots.length === 0 && (
              <option value="" disabled>No available slots for this doctor</option>
            )}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
        <Link to="/admin/bookings" className="btn btn-secondary ms-2">
          Cancel
        </Link>
      </form>
    </div>
  );
}

export default AdminEditBooking;