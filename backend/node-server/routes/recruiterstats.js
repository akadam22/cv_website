const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Sample data for demonstration
const stats = {
  total_companies: 10,
  total_candidates: 150,
  jobs_per_company: [
    { company: 'Company A', jobs_posted: 50 },
    { company: 'Company B', jobs_posted: 20 }
  ],
  candidates_per_company: [
    { company: 'Company A', candidates_applied: 200 },
    { company: 'Company B', candidates_applied: 100 }
  ],
  job_status_counts: {
    received: 30,
    under_review: 20,
    interview_scheduled: 15,
    rejected: 10,
    offer_letter: 5
  }
};

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Routes
app.get('/api/company-stats', (req, res) => {
  res.json(stats);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
