import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminSlotList() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = () => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/slots/`)
      .then(res => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/slots/${id}/`)
        .then(() => fetchSlots())
        .catch(() => alert('Failed to delete slot'));
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
        <h2>All Slots</h2>
        <Link to="/admin/slots/add" className="btn btn-primary">+ Add New slot</Link>
      </div>

      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No slots created yet.</td>
            </tr>
          ) : (
            slots.map(slot => {
              const expired = isExpired(slot.date, slot.time);
              return (
                <tr key={slot.id}>
                  <td className="ps-4">
                    <div className="fw-bold">
                      Dr. {slot.doctor.first_name} {slot.doctor.last_name}
                    </div>
                    <small className="text-muted">@{slot.doctor.username}</small>
                  </td>
                  <td>{slot.date}</td>
                  <td>{slot.time}</td>
                  <td>
                    {expired ? (
                      <span className="badge bg-secondary">Completed / Expired</span>
                    ) : slot.is_booked ? (
                      <span className="badge bg-secondary">Booked</span>
                    ) : (
                      <span className="badge bg-success">Available</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Delete
                    </button>
                    {!expired && (
                      <Link
                        to={`/admin/slots/edit/${slot.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminSlotList;