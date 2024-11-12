import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import styles from './VideoInterviewPage.module.css';

const VideoInterviewPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [followUpAttempts, setFollowUpAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0); // Initialize total score
  const MAX_FOLLOWUP_ATTEMPTS = 2;

  const speechSynthesis = window.speechSynthesis;
  const recognition = useRef(null);
  const timerRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    recognition.current = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;

    recognition.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setCurrentResponse(prev => prev + ' ' + transcript);
    };

    recognition.current.onend = () => {
      if (isRecording) {
        recognition.current.start();
      }
    };

    recognition.current.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      setError(`Microphone error: ${event.error}`);
    };

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [isRecording]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognition.current) recognition.current.stop();
      speechSynthesis.cancel();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Video Stream Error:', err);
      setStreamError(err.message);
      throw new Error('Failed to access camera. Please check your permissions and try again.');
    }
  };

  // Fetch questions from the server after submitting the resume
  const fetchQuestionsFromServer = async (resumeFile, jobTarget) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobTarget', jobTarget);

      const response = await fetch('/api/submit', { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      
      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('No questions available.');
      }

      // Store questions in state
      setQuestions(data.questions);
      
      // Set the first question
      setCurrentQuestion(data.questions[0].question);

      return data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Process user response and generate follow-up question
  const processResponse = async () => {
    if (!currentResponse.trim()) return;

    try {
      // Save response and calculate score
      if (isFollowUp) {
        totalScore += currentResponse.length > 0 ? 5 : -2; // Adjust scoring logic as needed
        setFollowUpAttempts(prev => prev + 1); // Increment follow-up attempts
      } else {
        totalScore += currentResponse.length > 0 ? 10 : -5; // Adjust scoring logic as needed
        responses.push(currentResponse.trim());
        
        // Move to next question
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setCurrentQuestion(questions[currentQuestionIndex + 1].question);
        } else {
          await handleEndInterview();
        }
        
        resetTimer(); // Reset timer after processing response
      }
      
    } catch (error) {
      console.error('Error processing response:', error);
    }
    
    resetTimer(); // Reset timer after processing response
    setCurrentResponse('');
  };

  
// Function to get a follow-up question from the server
const getFollowUpQuestion = async (question, response) => {
    try {
        const res = await fetch('/api/generate-followup', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, response })
        });

        if (!res.ok) throw new Error('Failed to generate follow-up question');

        const data = await res.json();
        return data.followUpQuestion;
    } catch (error) {
        console.error('Error getting follow-up question:', error);
        throw error;
    }
};

// Start interview process
const startInterview = async () => { 
   try { 
       await startVideoStream(); 
       // Pass resume file and job target here when starting the interview
       await fetchQuestionsFromServer(resumeFile, jobTarget); 

       if (questions.length === 0) throw new Error('No interview questions available'); 

       setIsInterviewStarted(true); 
   } catch (err) { 
       console.error('Start Interview Error:', err.message); 
       setError(err.message); 
   } 
};

// Handle end of interview process
const handleEndInterview = async () => { 
   try { 
       if (recognition.current) recognition.current.stop(); 
       clearInterval(timerRef.current); 

       // Prepare and save interview results including score
       const interviewData = { 
           questions: responses.map((response, index) => ({ 
               question: questions[index].question,
               response,
           })),
           totalScore,
           faceAnalysis: analysisResult 
       }; 

       await fetch('/api/save-interview-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(interviewData), });

       navigate('/results', { state: { interviewData }}); 

   } catch (err) { 
       console.error('End Interview Error:', err.message); 
       setError('Failed to end interview properly'); 
   } 
};

return (
   <div className={styles.videoPage}>
       <div className={styles.videoContainer}>
           <h1 className={styles.title}>Video Interview</h1>
           
           {(error || streamError) && (
               <div className={styles.error}>
                   {error || streamError}
               </div>
           )}

           <div className={styles.videoBox}>
               <video ref={videoRef} autoPlay playsInline muted></video>
               {isInterviewStarted && (
                   <div className={styles.interviewOverlay}>
                       <div className={styles.timer}>
                           Time Remaining: {timeRemaining}s
                       </div>
                       <div className={styles.questionIndicator}>
                           Question {currentQuestionIndex + 1} of {questions.length}
                       </div>
                       {currentQuestion && (
                           <div className={styles.currentQuestion}>
                               {currentQuestion}
                           </div>
                       )}
                   </div>
               )}
           </div>

           <div className={styles.controls}>
               {!isInterviewStarted ? (
                   <button className={styles.startButton} onClick={startInterview} disabled={isLoading}>
                       {isLoading ? 'Loading Questions...' : 'Start Interview'}
                   </button>
               ) : (
                   <button className={styles.endButton} onClick={handleEndInterview}>
                       End Interview
                   </button>
               )}
           </div>

           {/* Displaying Speech and Face Confidence */}
           <div className={styles.analysisResult}>
               <h3>Real-time Analysis:</h3>
               {/* Add facial analysis results here */}
           </div>
       </div>
   </div>
);

};

export default VideoInterviewPage;