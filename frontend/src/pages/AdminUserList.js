import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/`)
            .then(res => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}/`)
                .then(() => fetchUsers())
                .catch(err => {
                    const message = err.response?.data?.detail || 'Failed to delete user';
                    alert(message);
                });
        }
    };

    const handleToggleActive = (user) => {
        const action = user.is_active ? 'suspend' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            axios.patch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${user.id}/`, {
                is_active: !user.is_active,
            })
                .then(() => fetchUsers())
                .catch(err => {
                    const message = err.response?.data?.detail || `Failed to ${action} user`;
                    alert(message);
                });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Manage Users</h2>
                <Link to="/admin/users/add" className="btn btn-primary">+ Add New User</Link>
            </div>

            <table className="table table-hover align-middle mb-0">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role / Group</th>
                    <th>Status</th>
                    <th>Register Time</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.length === 0 ? (
                    <tr>
                        <td colSpan="9" className="text-center">No users found</td>
                    </tr>
                ) : (
                    users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email || '--'}</td>
                            <td>
                                {user.groups && user.groups.length > 0 ? (
                                    user.groups.map(group => (
                                        <span key={group.id}
                                              className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1 me-1">
                        {group.name}
                      </span>
                                    ))
                                ) : (
                                    <span
                                        className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
                      No Group
                    </span>
                                )}
                            </td>
                            <td>
                                {user.is_active ? (
                                    <span className="badge bg-primary">Active</span>
                                ) : (
                                    <span className="badge bg-danger">Inactive</span>
                                )}
                            </td>
                            <td>{new Date(user.date_joined).toLocaleString()}</td>
                            <td>
                                <div className="d-flex align-items-center gap-1">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Delete
                                    </button>
                                    <Link
                                        to={`/admin/users/edit/${user.id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={() => handleToggleActive(user)}
                                    >
                                        {user.is_active ? 'Suspend' : 'Activate'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserList;