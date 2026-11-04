import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import axios from 'axios';

function AdminUserForm() {
    const {id} = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        group: '',
    });
    const [loading, setLoading] = useState(isEdit);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // load groups
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/groups/`, {
            withCredentials: true
        })
            .then(res => setGroups(res.data))
            .catch(err => console.error(err));

        // load user data
        if (isEdit) {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}/`, {
                withCredentials: true
            })
                .then(res => {
                    const user = res.data;
                    setForm({
                        username: user.username || '',
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        email: user.email || '',
                        group: user.groups && user.groups.length > 0 ? user.groups[0].id : '',
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
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const payload = {
            username: form.username,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            group: form.group || null,
        };

        try {
            if (isEdit) {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}/`, payload);
            } else {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/`, payload);
            }
            navigate('/admin/users');
        } catch (err) {
            setErrors(err.response?.data || {non_field_errors: ['Save failed']});
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card shadow">
                    <div className="card-body">
                        <h3 className="card-title mb-4">
                            {isEdit ? 'Edit User' : 'Add New User'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {errors.non_field_errors && (
                                <div className="alert alert-danger">{errors.non_field_errors}</div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-bold">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.username && <div className="text-danger small">{errors.username}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="form-control"
                                    value={form.first_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="form-control"
                                    value={form.last_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.email && <div className="text-danger small">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">User Role / Group</label>
                                <select
                                    name="group"
                                    className="form-select"
                                    value={form.group}
                                    onChange={handleChange}
                                >
                                    <option value="">- Select Group -</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>

                            {!isEdit && (
                                <div className="alert alert-info py-2" role="alert">
                                    <strong>Note:</strong> The initial password for this account will be automatically
                                    set to <code>123456</code>.
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary me-2">
                                Save User
                            </button>
                            <Link to="/admin/users" className="btn btn-secondary">
                                Cancel
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUserForm;