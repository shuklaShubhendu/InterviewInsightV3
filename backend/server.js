const express = require('express');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const fsSync = require('fs');
const pdf = require('pdf-parse');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

// Verify essential environment variables
// if (!process.env.OPENAI_API_KEY) {
//   console.error('ERROR: OPENAI_API_KEY is required in .env file');
//   process.exit(1);
// }

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

const uploadsDir = './uploads';
const QUESTIONS_FILE_PATH = path.join(uploadsDir, 'interview_questions.txt');

// Create necessary directories if they don't exist
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir);
}

// Utility functions
const extractTextFromPDF = async (fileData) => {
  try {
    const data = await pdf(fileData);
    return data.text;
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Could not read the PDF file. Please ensure it\'s not corrupted or password protected.');
  }
};

const saveQuestions = async (questions) => {
  try {
    await fs.writeFile(QUESTIONS_FILE_PATH, JSON.stringify(questions, null, 2));
    console.log('Questions saved successfully');
    return QUESTIONS_FILE_PATH;
  } catch (error) {
    console.error('Save Questions Error:', error);
    throw new Error('Failed to save questions');
  }
};

// API endpoint for submitting resume and generating questions
app.post('/api/submit', async (req, res) => {
  try {
    if (!req.files?.resume || !req.body?.jobTarget) {
      return res.status(400).json({ error: 'Resume file and job target are required.' });
    }

    const { resume } = req.files;
    const { jobTarget } = req.body;

    if (resume.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed.' });
    }

    // Process resume
    const resumeText = await extractTextFromPDF(resume.data);
    
    // Get ATS Score
    const atsResponse = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Analyze this resume for the position of ${jobTarget}. Provide:
        1. An ATS compatibility score (0-100)
        2. 2-3 specific improvements needed
        First verify this is a valid resume and job target.`,
      max_tokens: 150,
    });

    const atsScoreResponse = atsResponse.choices[0].text.trim();
    
    // Generate interview questions
    const questionsResponse = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Based on this resume for ${jobTarget} position, generate 5 relevant technical interview questions:
        Resume: ${resumeText}`,
      max_tokens: 300,
    });

    const questionsText = questionsResponse.choices[0].text.trim();
    
    // Log generated questions text for debugging
    console.log("Generated Questions Text:", questionsText);

    const questions = questionsText.split('\n')
      .filter(q => q.trim())
      .map(q => ({ question: q.trim() }));

    // Check if questions were generated properly
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No valid questions generated from the resume.' });
    }

    // Save questions to file
    const filePath = await saveQuestions(questions);

    res.json({
      atsScore: atsScoreResponse,
      suggestions: atsScoreResponse.includes('improvements') ? atsScoreResponse.split('improvements')[1] : null,
      questions,
      filePath
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request.' 
    });
  }
});

// Endpoint to generate follow-up question based on a user's response
app.post('/api/generate-followup', async (req, res) => {
  try {
    const { question, response } = req.body;

    const followUpResponse = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Given the question "${question}" and the response "${response}", generate a relevant follow-up question.`,
      max_tokens: 150,
    });

    const followUpQuestion = followUpResponse.choices[0].text.trim();

    res.json({ followUpQuestion });
    
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    res.status(500).json({ error: 'Failed to generate follow-up question' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});