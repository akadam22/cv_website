const path = require('path');
const fs = require('fs');
const pool = require('../db'); // Database connection
const express = require('express');
const router = express.Router();
const natural = require('natural');
const WordNet = require('node-wordnet');
const wordnet = new WordNet();
const cron = require('node-cron');
const axios = require('axios');

// ===================== Helper Functions =====================

const getResumePath = async (candidateId) => {
    const [rows] = await pool.promise().query('SELECT file_path FROM resume WHERE user_id = ?', [candidateId]);
    return rows.length > 0 ? rows[0].file_path : null;
};

const getResumeContent = async (candidateId) => {
    const resumePath = await getResumePath(candidateId);
    if (!resumePath) return '';

    const cleanedResumePath = resumePath.replace(/^uploads\//, ''); // Remove extra 'uploads/' if present
    const filePath = path.join(__dirname, '../uploads', cleanedResumePath);
    try {
        return await fs.promises.readFile(filePath, 'utf-8');
    } catch (err) {
        console.error(`Error reading file at ${filePath}:`, err);
        return ''; // Return empty content on error
    }
};

const getResumeIdForCandidate = async (candidateId) => {
    const [rows] = await pool.promise().query('SELECT id FROM resume WHERE user_id = ?', [candidateId]);
    return rows.length > 0 ? rows[0].id : null;
};

// ===================== Text Processing =====================

// Function to extract keywords and synonyms from text
const extractKeywordsAndSynonyms = async (text) => {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    
    let keywords = [];
    tfidf.listTerms(0).forEach(term => keywords.push(term.term));
    
    let allKeywords = new Set(keywords);

    for (const keyword of keywords) {
        try {
            const definitions = await new Promise((resolve, reject) => {
                wordnet.lookup(keyword, (err, defs) => {
                    if (err) return reject(err);
                    resolve(defs);
                });
            });
            const synonyms = definitions.flatMap(def => def.meta?.synonyms || []);
            synonyms.forEach(synonym => allKeywords.add(synonym));
        } catch (error) {
            console.error(`Error looking up synonyms for keyword "${keyword}":`, error);
        }
    }

    return Array.from(allKeywords).join(' ');
};

// ===================== Parsing =====================

const parseResume = async (resume) => {
    return await extractKeywordsAndSynonyms(resume);
};

const getCandidates = async () => {
    const [candidates] = await pool.promise().query('SELECT * FROM users WHERE role = ?', ['candidate']);
    return candidates;
};

const getCandidateDetails = async (candidate) => {
    const resumeText = await getResumeContent(candidate.id);  // Fetch resume content
    const parsedResume = await parseResume(resumeText);
    return {
        ...candidate,
        resumeText: parsedResume
    };
};

// ===================== Job Parsing =====================

const parseJobDescription = async (description) => {
    return await extractKeywordsAndSynonyms(description);
};

const getJobs = async () => {
    const [jobs] = await pool.promise().query('SELECT * FROM job');
    return jobs;
};

const getJobDetails = async (job) => {
    const parsedDescription = await parseJobDescription(job.description);
    return {
        ...job,
        jobText: parsedDescription
    };
};

// ===================== Similarity Calculation =====================

const calculateSimilarity = (resumeContent, jobContent) => {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(resumeContent);
    tfidf.addDocument(jobContent);

    let score = 0;
    tfidf.tfidfs(jobContent, (i, measure) => {
        score += measure;
    });

    return score;  // Higher score indicates better match
};

const matchCandidateToJob = async (candidate, job) => {
    const similarityScore = calculateSimilarity(candidate.resumeText, job.jobText);
    return similarityScore > 0.2;  // Threshold can be adjusted
};

// ===================== Auto-Apply =====================

// Check if the candidate has already applied for the job
const hasAppliedForJob = async (userId, jobId) => {
    const [rows] = await pool.promise().query('SELECT * FROM jobapplication WHERE user_id = ? AND job_id = ?', [userId, jobId]);
    return rows.length > 0;
};

const applyForJob = async (userId, jobId, resumeId) => {
    if (await hasAppliedForJob(userId, jobId)) {
        console.log(`Candidate ${userId} has already applied for job ${jobId}. Skipping.`);
        return;
    }

    const sql = 'INSERT INTO jobapplication (job_id, user_id, resume_id, status) VALUES (?, ?, ?, ?)';
    try {
        await pool.promise().query(sql, [jobId, userId, resumeId, 'Applied']);
    } catch (err) {
        console.error('Error applying for job:', err);
    }
};

const autoApplyJobsForExistingJobs = async () => {
    try {
        const candidates = await getCandidates();
        const jobs = await getJobs();

        for (const job of jobs) {
            const jobDetails = await getJobDetails(job);

            for (const candidate of candidates) {
                const candidateDetails = await getCandidateDetails(candidate);

                console.log(`Matching candidate ${candidate.id} with job ${job.id}`);

                if (await matchCandidateToJob(candidateDetails, jobDetails)) {
                    const resumeId = await getResumeIdForCandidate(candidate.id);
                    
                    if (resumeId) {
                        console.log(`Applying for job ${job.id} for candidate ${candidate.id}...`);
                        await applyForJob(candidate.id, job.id, resumeId);
                        console.log(`Successfully applied for job ${job.id} for candidate ${candidate.id}.`);
                    } else {
                        console.log(`No resume found for candidate ${candidate.id}. Skipping.`);
                    }
                } else {
                    console.log(`Candidate ${candidate.id} is not a match for job ${job.id}.`);
                }
            }
        }
    } catch (error) {
        console.error('Error in autoApplyJobsForExistingJobs:', error);
    }
};

// Create a route to trigger auto-apply manually (or for the first time)
router.post('/auto-apply-existing', async (req, res) => {
    try {
        await autoApplyJobsForExistingJobs();
        res.send('Auto-apply for existing jobs and candidates completed.');
    } catch (error) {
        console.error('Error processing auto-apply for existing jobs:', error);
        res.status(500).send('Error processing auto-apply for existing jobs.');
    }
});

const autoApplyJobsForNewJob = async (jobId) => {
    try {
        const candidates = await getCandidates();
        const [job] = await pool.promise().query('SELECT * FROM job WHERE id = ?', [jobId]);

        if (!job || job.length === 0) {
            throw new Error('Job not found');
        }

        const jobDetails = await getJobDetails(job[0]);

        for (const candidate of candidates) {
            const candidateDetails = await getCandidateDetails(candidate);

            if (await matchCandidateToJob(candidateDetails, jobDetails)) {
                const resumeId = await getResumeIdForCandidate(candidate.id);
                if (resumeId) {
                    await applyForJob(candidate.id, jobId, resumeId);
                }
            }
        }
    } catch (error) {
        console.error('Error in autoApplyJobsForNewJob:', error);
    }
};

router.post('/jobs', async (req, res) => {
    const { description, title, ...jobDetails } = req.body;

    try {
        const sql = 'INSERT INTO job (title, description, ...) VALUES (?, ?, ...)';  // Complete SQL with actual job fields
        const [result] = await pool.promise().query(sql, [title, description, ...jobDetails]);

        const newJobId = result.insertId;

        // Trigger auto-apply for all candidates when a new job is added
        await autoApplyJobsForNewJob(newJobId);

        res.status(201).send('Job posted and auto-applied to candidates.');
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).send('Error creating job.');
    }
});

// Schedule job to run every 10 seconds (or adjust as needed)
cron.schedule('*/10 * * * * *', async () => {
    console.log('Running scheduled auto-apply...');
    try {
        await autoApplyJobsForExistingJobs();
        console.log('Scheduled auto-apply completed.');
    } catch (error) {
        console.error('Error during scheduled auto-apply:', error);
    }
});

// Helper function to get synonyms using Datamuse API
const getSynonyms = async (word) => {
    try {
        const response = await axios.get(`https://api.datamuse.com/words?rel_syn=${word}`);
        return response.data.map(entry => entry.word);
    } catch (error) {
        console.error('Error fetching synonyms:', error);
        return [];
    }
};

module.exports = router;
