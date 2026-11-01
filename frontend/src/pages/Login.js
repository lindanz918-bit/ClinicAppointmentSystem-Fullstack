import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login/`, {
        username,
        password,
      });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5">
        <div className="card shadow border-0 rounded-3">
          <div className="card-body p-4">
            <h3 className="card-title text-center mb-4 text-primary fw-bold">Sign In</h3>

            {error && (
              <div className="alert alert-danger py-2">
                <small className="fw-bold">{error}</small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                Sign In
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Don't have an account? <Link to="/register" className="fw-bold">Register here</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;