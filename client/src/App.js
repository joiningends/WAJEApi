
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/pages/login';
import Register from './components/pages/register';
import Home from './components/pages/home';
import ClientDetails from './components/pages/tracking';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/clients/:clientId" element={<ClientDetails />} />
        
      </Routes>
    </Router>
  );
}

export default App;
