import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AdminSlotForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // load doctors
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`)
      .then(res => setDoctors(res.data))
      .catch(err => console.error(err));

    // if edit, load current slot
    if (isEdit) {
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/slots/${id}/`)
        .then(res => {
          setForm({
            doctor: res.data.doctor.id,
            date: res.data.date,
            time: res.data.time.slice(0, 5), // 去掉秒
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // can not select the past date
    const slotDateTime = new Date(`${form.date}T${form.time}`);
    if (slotDateTime < new Date()) {
      setErrors({ non_field_errors: ['Cannot create or update a slot in the past.'] });
      return;
    }

    const payload = {
      doctor_id: form.doctor,
      date: form.date,
      time: form.time,
    };

    try {
      if (isEdit) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/slots/${id}/`, payload);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/slots/`, payload);
      }
      navigate('/admin/slots');
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Save failed'] });
    }
  };

  if (loading) return <div>Loading...</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="card-title mb-4">
              {isEdit ? 'Edit Slot' : 'Add New Slot'}
            </h3>
            <form onSubmit={handleSubmit}>
              {errors.non_field_errors && (
                <div className="alert alert-danger">{errors.non_field_errors}</div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">Doctor</label>
                <select
                  name="doctor"
                  className="form-select"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                  disabled={isEdit} // could not change doctor when edit
                >
                  <option value="">- Select a Doctor -</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.first_name} {doc.last_name} (@{doc.username})
                    </option>
                  ))}
                </select>
                {errors.doctor && <div className="text-danger small">{errors.doctor}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
                {errors.date && <div className="text-danger small">{errors.date}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Time</label>
                <input
                  type="time"
                  name="time"
                  className="form-control"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
                {errors.time && <div className="text-danger small">{errors.time}</div>}
              </div>

              <button type="submit" className="btn btn-primary me-2">
                Save Slot
              </button>
              <Link to="/admin/slots" className="btn btn-secondary">
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSlotForm;