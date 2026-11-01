import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminDoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBio, setSelectedBio] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`)
      .then(res => {
        setDoctors(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/${id}/`)
        .then(() => fetchDoctors())
        .catch(err => alert('Failed to delete doctor'));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">All Doctors</h2>
        </div>
        <Link to="/admin/doctors/add" className="btn btn-primary fw-bold shadow-sm">
          + Add New Doctor
        </Link>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Doctor Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No doctors found. Click <strong>+ Add New Doctor</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  doctors.map(doctor => (
                    <tr key={doctor.id}>
                      <td className="ps-4">
                        <div className="fw-bold">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </div>
                        <small className="text-muted">@{doctor.username}</small>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone || 'N/A'}</td>
                      <td>
                        {doctor.experience ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedBio(doctor)}
                          >
                            View Experience
                          </button>
                        ) : (
                          <span className="text-muted small">None</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <Link
                          to={`/admin/doctors/edit/${doctor.id}`}
                          className="btn btn-primary btn-sm me-2"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(doctor.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      {selectedBio && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Dr. {selectedBio.first_name} {selectedBio.last_name} - Bio
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBio(null)}></button>
              </div>
              <div className="modal-body text-start" style={{ whiteSpace: 'pre-line' }}>
                {selectedBio.experience}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBio(null)}>
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

export default AdminDoctorList;