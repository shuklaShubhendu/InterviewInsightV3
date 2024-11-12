import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './components/SignUp/SignUpPage';
import LoginPage from './components/Login/LoginPage';
import HomePage from './components/Homepage';
import ResumeScorePage from './components/ResumeScorePage';
import VideoInterviewPage from './components/VideoInterviewPage';
import ResultPage from './components/ResultPage';
import StarsBackground from './components/StarsBackground'; // Import your stars background
import './App.css';  // Import your global CSS for styling

function App() {
  return (
    <Router>
      <div className="app">
        {/* Background stars */}
        <StarsBackground /> {/* This will ensure stars are part of the background */}
        
        {/* Logo that appears on all pages */}
        <img src="/images/interview-logo.png" alt="Logo" className="logo" />
        
        {/* Routes for your app pages */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/resume-score" element={<ResumeScorePage />} />
            <Route path="/video-interview" element={<VideoInterviewPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
