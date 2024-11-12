import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignUpPage.css";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { auth } from "../FirebaseConfig"; // Import Firebase auth
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase sign-up function

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Simple validation for name, email, and password
    const errors = {};
    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        // Firebase sign-up method
        await createUserWithEmailAndPassword(auth, email, password);
        // After successful sign-up, navigate to login page
        navigate('/login');
      } catch (error) {
        // Handle sign-up errors (e.g., email already in use)
        console.error('Error signing up:', error);
        setFormErrors({ firebase: error.message });
      }
    }
  };

  return (
    <div className="addUser">
      <h2>Sign Up</h2>
      <form className="addUserForm" onSubmit={handleSignUp}>
        <div className="inputGroup">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="off"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formErrors.name ? 'input-error' : ''}
          />
          <FaUser  className="user"/>
          {formErrors.name && <p className="error-message">{formErrors.name}</p>}
          
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
          <MdOutlineMail  className="hel"/>
          {formErrors.email && <p className="error-message">{formErrors.email}</p>}
          
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="off"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formErrors.password ? 'input-error' : ''}
          />
          <RiLockPasswordFill className="bew"/>
          {formErrors.password && <p className="error-message">{formErrors.password}</p>}
          
          <button type="submit" className="btn btn-success">
            Sign Up
          </button>
        </div>
      </form>
      
      <div className="login">
        <p>Already have an Account?</p>
        <Link to="/login" className="btn btn-primary" style={{ marginLeft: '5px' }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
