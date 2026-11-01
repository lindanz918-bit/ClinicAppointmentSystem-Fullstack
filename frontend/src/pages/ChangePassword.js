import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChangePassword({ user }) {
  const [form, setForm] = useState({ old_password: '', new_password1: '', new_password2: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/change-password/`, form);
      navigate('/password-changed');
    } catch (err) {
      setErrors(err.response?.data || {});
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4">
            <h3 className="fw-bold text-primary mb-3">Change Password</h3>
            <p className="text-muted small mb-4">
              Please enter your old password, then enter and confirm your new password.
            </p>

            <form onSubmit={handleSubmit}>
              {['old_password', 'new_password1', 'new_password2'].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label fw-bold">
                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="password"
                    name={field}
                    className="form-control"
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                  {errors[field] && <div className="text-danger small">{errors[field]}</div>}
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary fw-bold px-4">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;