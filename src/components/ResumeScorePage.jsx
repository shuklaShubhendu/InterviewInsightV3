// can you remove the tailwind css and give sepeate css file for this 
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResumeScorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (location.state?.atsScore) {
      // Parse the score from the response
      const atsResponse = location.state.atsScore;
      const scoreMatch = atsResponse.match(/score:\s*(\d+)/i) || 
                        atsResponse.match(/compatibility score:\s*(\d+)/i);
      const numericScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      setScore(numericScore);

      // Parse suggestions - look for lines after "improvements needed:" or similar phrases
      const improvementSection = atsResponse.toLowerCase().split(/improvements needed:|specific improvements:|suggestions:|improvements:/i)[1];
      if (improvementSection) {
        const suggestionsList = improvementSection
          .split(/[a-z]\)|\d\.|\n-|\n\*/)
          .filter(item => item.trim())
          .map(item => item.trim());
        setSuggestions(suggestionsList);
      }
    }
  }, [location.state]);

  const handleStartInterview = () => {
    navigate('/video-interview');
  };

  return (
    <div className="min-h-screen text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="fill-none stroke-gray-700"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                className="fill-none stroke-green-500"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-4xl font-bold text-green-500">{score}%</div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex-grow">
            <h2 className="text-2xl font-semibold mb-4 text-center md:text-left text-color:green">
              Suggestions for Improvement:
            </h2>
            <div className="max-h-64 overflow-y-auto pr-4">
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 mt-2 mr-3 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleStartInterview}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeScorePage;