import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import './login.css';
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:4000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setToken(result.token);

        // Store the token in localStorage
        localStorage.setItem('token', result.token);

        navigate('/home');
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error occurred during login:', error);
      setError('Failed to log in. Please try again later.');
    }
  };

  useEffect(() => {
    setError(null);

    // Check token expiration when the component mounts
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert milliseconds to seconds

      // Check if the token has expired
      if (decodedToken.exp < currentTime) {
        setToken('');
        navigate('/');
      }
    }
  }, [token, navigate]);

 
    return (
      <div className="login">
      <div className="login-container">
        <div className="animated-text-container">
    <div className="animated-text">
      <span style={{ '--index': 1 }}>J</span>
      <span style={{ '--index': 2 }}>o</span>
      <span style={{ '--index': 3 }}>i</span>
      <span style={{ '--index': 4 }}>n</span>
      <span style={{ '--index': 5 }}>i</span>
      <span style={{ '--index': 6 }}>n</span>
      <span style={{ '--index': 7 }}>g</span>
      <span style={{ '--index': 8 }}>E</span>
      <span style={{ '--index': 9 }}>n</span>
      <span style={{ '--index': 10 }}>d</span>
      <span style={{ '--index': 11 }}>s</span>
    </div>
  </div>
  
  
        {/* Login Form Container */}
        <div className="login-page">
          <h2>Login</h2>
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
      </div>
    );
  }
  
  export default Login;