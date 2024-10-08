// src/components/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:4000/api/register', { username, password, email });
      alert('User registered successfully');
    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterPage;
