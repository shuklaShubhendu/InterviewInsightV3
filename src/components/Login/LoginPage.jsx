import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";
import { FaBeer } from 'react-icons/fa';
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { auth } from "../FirebaseConfig"; // Import your Firebase authentication
import { signInWithEmailAndPassword } from "firebase/auth"; // Import signIn method from Firebase Auth

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Simple validation for email and password
    const errors = {};
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        // Firebase signIn method
        await signInWithEmailAndPassword(auth, email, password);
        // If login is successful, navigate to home page
        navigate('/home');
      } catch (error) {
        // Handle login error (e.g., incorrect credentials)
        console.error('Error logging in:', error);
        setFormErrors({ firebase: error.message });
      }
    }
  };

  return (
    
    
    <div className="addUser">
      <h2>LOGIN</h2>
      <form className="addUserForm" onSubmit={handleLogin}>
        <div className="inputGroup">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="off"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={formErrors.email ? 'input-error' : ''}
          />
          <MdOutlineMail  className="icon"/>

          {formErrors.email && <p className="error-message">{formErrors.email}</p>}
          
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="off"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formErrors.password ? 'input-error' : ''}
          />
          <RiLockPasswordFill className="icons"/>
          {formErrors.password && <p className="error-message">{formErrors.password}</p>}
          
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
      </form>
      
      <div className="login">
        <p>Don't have an Account?</p>
        <Link to="/" className="btn btn-success" style={{ marginLeft: '5px' }}>
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
