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
    if (!selectedUser) return; // Ensure there's a selected user
  
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No JWT token found. User may need to log in.');
      return;
    }
  
    axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, selectedUser, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('User updated successfully:', response.data);
        setUsers(users.map(user => (user.id === selectedUser.id ? response.data : user)));
        closeUpdateModal();
      })
      .catch(error => {
        console.error('Error updating user:', error);
        console.log('JWT Token:', localStorage.getItem('jwtToken'));
      });
  };
  
  
  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error('Selected user is invalid:', selectedUser);
      return;
    }
  
    console.log('Deleting user with ID:', selectedUser.id);
  
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      console.log('User deleted successfully:', response.data);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting user:', error.response ? error.response.data : error.message);
    }
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
              <td>{user.name}</td>
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
              <input type="text"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} />
            </label>
            <label>
              Email:
              <input  type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} />
            </label>
            <label>
              Role:
              <input type="text"
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}/>
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
      <p>Are you sure you want to delete {selectedUser.name}?</p>
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
