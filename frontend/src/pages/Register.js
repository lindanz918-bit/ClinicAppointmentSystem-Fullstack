import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register/`, form);
      navigate('/login');
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Registration failed'] });
    }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4">
            <h3 className="card-title text-center mb-4 text-primary fw-bold">Patient Registration</h3>

            <form onSubmit={handleSubmit}>
              {['username', 'first_name', 'last_name', 'email', 'password', 'password2'].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label fw-bold">
                    {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type={field.includes('password') ? 'password' : 'text'}
                    name={field}
                    className="form-control"
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                  {errors[field] && <div className="text-danger small mt-1">{errors[field]}</div>}
                </div>
              ))}

              <button type="submit" className="btn btn-success w-100 py-2 fw-bold mt-3">
                Create Account
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Already registered? <Link to="/login" className="fw-bold">Log in here</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;