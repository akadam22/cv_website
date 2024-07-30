import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/UserManagement.css'; // Create and style this CSS file as needed
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Add this line to avoid accessibility warning

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Fetch users from Flask API
    axios.get('http://localhost:5000/api/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const openUpdateModal = (user) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedUser(null);
    setIsUpdateModalOpen(false);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteModalOpen(false);
  };

  const handleUpdateUser = () => {
    // Implement user update logic here
    closeUpdateModal();
  };

  const handleDeleteUser = () => {
    // Implement user delete logic here
    closeDeleteModal();
  };

  return (
    <div className="user-management">
      <br></br><br></br><br></br><br></br>
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => openUpdateModal(user)}>Update</button>
                <button onClick={() => openDeleteModal(user)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isUpdateModalOpen}
        onRequestClose={closeUpdateModal}
        contentLabel="Update User"
      >
        <h2>Update User</h2>
        {selectedUser && (
          <div>
            <label>
              Username:
              <input type="text" defaultValue={selectedUser.username} />
            </label>
            <label>
              Email:
              <input type="email" defaultValue={selectedUser.email} />
            </label>
            <label>
              Role:
              <input type="text" defaultValue={selectedUser.role} />
            </label>
            <div className="modal-buttons">
              <button onClick={handleUpdateUser}>Save</button>
              <button onClick={closeUpdateModal}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete User"
      >
        <h2>Delete User</h2>
        {selectedUser && (
          <div>
            <p>Are you sure you want to delete {selectedUser.username}?</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteUser}>Delete</button>
              <button onClick={closeDeleteModal}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserManagement;
