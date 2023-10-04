import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import jwtDecode from 'jwt-decode';

function HomePage() {
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage] = useState(5);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('token');

    if (token) {
      
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; 

      if (decodedToken.exp < currentTime) {
        // Token has expired
        setAuthenticated(false);
        localStorage.removeItem('token'); 
        navigate('/'); 
      } else {
        // Token is still valid
        setAuthenticated(true);

        axios
          .get('http://localhost:4000/api/v1/clients', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setClients(response.data);
          })
          .catch((error) => {
            console.error('Error fetching clients:', error);
          });
      }
    } else {
      // User is not logged in, redirect to login page
      navigate('/');
    }
  }, [navigate]);

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreateClient = () => {
    if (newClientName.trim() === '') {
      setErrorMessage('Please enter a name.');
      return;
    }

    axios
      .post(
        'http://localhost:4000/api/v1/clients',
        { name: newClientName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Send the token in the request headers
          },
        }
      )
      .then((response) => {
        setClients([...clients, response.data]);
        setNewClientName('');
        setErrorMessage('');
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Error creating client:', error);
        setErrorMessage('Failed to create client. Please try again later.');
      });
  };

  const handleLogout = () => {
    // Clear the token when logging out
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="home-page">
      {authenticated && (
        <header className="header">
          <div className="logo">
            <img
              src="https://lh3.googleusercontent.com/p/AF1QipPQVmbzTfYibJVGgymUsbIBblu5U9bwG3rah_6N=s680-w680-h510"
              alt="Inspiron Logo"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="add-button">
            Add Client
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>
      )}

      {isModalOpen && authenticated && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>

            <h3>Add a Client</h3>
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter client name"
                className="client-name-input"
                value={errorMessage ? errorMessage : newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
            </div>
            <button onClick={handleCreateClient} className="create-button">
              Create Client
            </button>
          </div>
        </div>
      )}

      {authenticated && (
        <table className="client-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentClients.map((client) => (
              <tr key={client._id}>
                <td>{client.name}</td>
                <td>
                  <Link to={`/clients/${client._id}`} className="view-button">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {authenticated && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(clients.length / clientsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          
        </div>
      )}
    </div>
  );
}

export default HomePage;
