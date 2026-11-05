import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

function ChangePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword1 !== newPassword2) {
            setError('New passwords do not match.');
            return;
        }

        try {
            const access = localStorage.getItem('access_token');
            await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/auth/change-password/`,
                {
                        old_password: oldPassword,
                        new_password1: newPassword1,
                        new_password2: newPassword2,
                    },
            {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                   }
            );
            setSuccess('Password updated successfully!');
            setTimeout(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.is_staff || user.is_superuser) {
                    window.location.href = '/admin/bookings';
                } else if (user.doctor) {
                    window.location.href = '/doctor/dashboard';
                } else {
                    window.location.href = '/my-bookings';
                }
            }, 1500);

        } catch (err) {
            const data = err.response?.data;
            if (data?.old_password) {
                setError(data.old_password[0]);
            } else if (data?.new_password2) {
                setError(data.new_password2[0]);
            } else {
                setError('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-5">
                <div className="card shadow border-0 rounded-3">
                    <div className="card-body p-4">
                        <h3 className="card-title text-center mb-3 text-primary fw-bold">Change Password</h3>
                        <p className="text-muted text-center small mb-4">
                            Please enter your old password, then enter and confirm your new password.
                        </p>

                        {error && (
                            <div className="alert alert-danger py-2" role="alert">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success py-2" role="alert">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Old Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">New Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword1}
                                    onChange={(e) => setNewPassword1(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassword2}
                                    onChange={(e) => setNewPassword2(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
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