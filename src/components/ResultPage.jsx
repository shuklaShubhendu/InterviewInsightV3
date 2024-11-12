import React, { useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import "./ResultPage.css";

const ResultPage = () => {
  const [activeTab, setActiveTab] = useState("response");

  const scores = [
    { title: "Clarity and Communication", score: 8 },
    { title: "Relevance and Depth", score: 5 },
    { title: "Problem Solving and Critical Thinking", score: 7 },
    { title: "Adaptability and Flexibility", score: 6 },
  ];

  // Calculate total response score based on defined logic
  const totalResponseScore = scores.reduce((acc, curr) => acc + curr.score, 0);
  const confidenceScore = 65; // Example confidence score

  return (
    <div className="result-page">
      <h1>Interview Result</h1>

      <div className="main-content">
        {/* Left side with four boxes */}
        <div className="left-container">
          {scores.map((item, index) => {
            // Determine color based on the score
            const fillColor = item.score >= 6 ? "green" : "red";
            const scorePercentage = (item.score / 10) * 100; // Assuming max score is 10

            return (
              <div className="box" key={index}>
                <h3>{item.title}</h3>
                <div className="score-display">
                  <span>{item.score}</span>
                </div>
                <div
                  className="score-bar"
                  style={{
                    width: `${scorePercentage}%`,
                    backgroundColor: fillColor,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right side with the speedometer */}
        <div className="right-container">
          <div className="tabs">
            <button
              onClick={() => setActiveTab("response")}
              className={activeTab === "response" ? "active" : ""}
            >
              Response Score
            </button>
            <button
              onClick={() => setActiveTab("confidence")}
              className={activeTab === "confidence" ? "active" : ""}
            >
              Confidence
            </button>
          </div>

          {/* Render speedometer based on activeTab */}
          <div className="tab-content">
            <h3>{activeTab === "response" ? "Answer Score" : "Speech & Facial Confidence"}</h3>
            <ReactSpeedometer
              value={activeTab === "response" ? totalResponseScore : confidenceScore}
              maxValue={activeTab === "response" ? scores.length * 10 : 100}
            />
            <p className="score-text">
              Total Score: {activeTab === "response" ? totalResponseScore : confidenceScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
