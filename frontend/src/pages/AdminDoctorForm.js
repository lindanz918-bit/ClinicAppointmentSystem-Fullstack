import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AdminDoctorForm() {
  const { id } = useParams(); // add if with id, create if no id
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    specialization: '',
    email: '',
    phone: '',
    experience: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/${id}/`)
        .then(res => {
          setForm(res.data);
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
    try {
      if (isEdit) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/${id}/`, form);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/doctors/`, form);
      }
      navigate('/admin/doctors');
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Save failed'] });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="card-title mb-4">
              {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
            </h3>
            <form onSubmit={handleSubmit}>
              {[
                { name: 'username', label: 'Username', type: 'text' },
                { name: 'first_name', label: 'First Name', type: 'text' },
                { name: 'last_name', label: 'Last Name', type: 'text' },
                { name: 'specialization', label: 'Specialization', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone', type: 'text' },
              ].map(field => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label fw-bold">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    className="form-control"
                    value={form[field.name] || ''}
                    onChange={handleChange}
                    required
                  />
                  {errors[field.name] && (
                    <div className="text-danger small">{errors[field.name]}</div>
                  )}
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label fw-bold">Experience</label>
                <textarea
                  name="experience"
                  className="form-control"
                  rows="4"
                  placeholder="Enter doctor's qualifications, years of experience, expertise, background, etc."
                  value={form.experience || ''}
                  onChange={handleChange}
                />
                {errors.experience && (
                  <div className="text-danger small">{errors.experience}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary me-2">
                Save Doctor
              </button>
              <Link to="/admin/doctors" className="btn btn-secondary">
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDoctorForm;