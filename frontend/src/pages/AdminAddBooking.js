import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminAddBooking() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load doctors and users
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/?group=Patient`),
    ])
      .then(([docRes, userRes]) => {
        setDoctors(docRes.data);
        setUsers(userRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // load slots for selected doctor
  useEffect(() => {
  if (selectedDoctor) {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/slots/?doctor=${selectedDoctor}&is_booked=false`)
      .then(res => {
        const now = new Date();
        // filter overdue slots for admin
        const futureSlots = res.data.filter(slot => {
          const slotDateTime = new Date(`${slot.date}T${slot.time}`);
          return slotDateTime >= now;
        });
        setSlots(futureSlots);
      })
      .catch(err => console.error(err));
  } else {
    setSlots([]);
  }
}, [selectedDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedUser || !selectedSlot) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/bookings/`, {
        patient: selectedUser,
        slot_id: selectedSlot,
      });
      navigate('/admin/bookings');
    } catch (err) {
      alert('Failed to create booking: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Admin Add Booking</h2>

      {/* Step 1: Select Doctor */}
      <div className="mb-4">
        <label className="form-label fw-bold">1. Select Doctor:</label>
        <select
          className="form-select"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">-- Choose Doctor First --</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>
              Dr. {d.first_name} {d.last_name} @{d.username} ({d.specialization})
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Booking Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">2. Select Patient:</label>
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">-- Select Patient --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} @{u.username} ({u.email || 'No email'})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">3. Select Available Slot:</label>
          <select
            className="form-select"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            required
            disabled={!selectedDoctor}
          >
            <option value="">
              {selectedDoctor
                ? '-- Select Available Time Slot --'
                : '-- Please Select a Doctor Above First --'}
            </option>
            {slots.map(s => (
              <option key={s.id} value={s.id}>
                {s.date} at {s.time.slice(0, 5)}
              </option>
            ))}
            {selectedDoctor && slots.length === 0 && (
              <option value="" disabled>No available unbooked slots for this doctor</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!selectedDoctor || !selectedSlot}
        >
          Confirm Booking
        </button>
        <Link to="/admin/bookings" className="btn btn-secondary ms-2">
          Cancel
        </Link>
      </form>
    </div>
  );
}

export default AdminAddBooking;