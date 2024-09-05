const path = require('path');//file handling
const fs = require('fs'); //allows you to work with the file system, like reading or writing files.
const pool = require('../db'); // Database connection
const express = require('express'); //api routes
const router = express.Router(); //manage different routes in your Express application.
const natural = require('natural');  //text processing, extracting words
const WordNet = require('node-wordnet'); // finding synonyms
const wordnet = new WordNet();
const cron = require('node-cron'); //scheduling the job applying tasks 10 secs interval
const axios = require('axios'); // for external API requests
const mammoth = require('mammoth'); //getting texts from resumes (.doc)files and pdf-parse for pdf files
const tokenizer = new natural.WordTokenizer();
const nodemailer = require('nodemailer'); //Email Notification
const dotenv = require('dotenv');
dotenv.config();
// Automatic job apply

// ===================== Helper Functions =====================

// Get the resume file path from the database for a given candidate
const getResumePath = async (candidateId) => {
    const [rows] = await pool.promise().query('SELECT file_path FROM resume WHERE user_id = ?', [candidateId]);
    return rows.length > 0 ? rows[0].file_path : null;
};

// Read resume content from the file system
const getResumeContent = async (candidateId) => {
    const resumePath = await getResumePath(candidateId);
    if (!resumePath) return '';

    const cleanedResumePath = resumePath.replace(/^uploads\//, '');
    const filePath = path.join(__dirname, '../uploads', cleanedResumePath);

    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (err) {
        console.error(`Error reading resume for ${candidateId}: ${err}`); // Log errors
        return '';
    }
};

// Get the resume ID for a given candidate
const getResumeIdForCandidate = async (candidateId) => {
    const [rows] = await pool.promise().query('SELECT id FROM resume WHERE user_id = ?', [candidateId]);
    return rows.length > 0 ? rows[0].id : null;
};

// ===================== Text Processing =====================

// Extract keywords and synonyms from text
const extractKeywordsAndSynonyms = async (text) => {
    const tfidf = new natural.TfIdf();//creates tfidf instance from natural library
    tfidf.addDocument(text); // adds text to document

    const keywords = tfidf.listTerms(0).map(term => term.term); //returns the term into array of object .map helps in transforming the obj to term string.
//map: Transforms each element in an array based on the function provided.
    const allKeywords = new Set(keywords);

    for (const keyword of keywords) {
        try {
            const definitions = await new Promise((resolve, reject) => {//Promise: Handles asynchronous operations and represents their eventual completion or failure.
                wordnet.lookup(keyword, (err, defs) => {
                    if (err) return reject(err);
                    resolve(defs);
                });
            });//flatMap is used to map each definition object to its synonyms and flatten the result into a single array
            const synonyms = definitions.flatMap(def => def.meta?.synonyms || []);
            synonyms.forEach(synonym => allKeywords.add(synonym));
        } catch (error) {
            
        }
    }

    return Array.from(allKeywords).join(' ');
};

// Parse resume text  processes and cleans the resume text, and then extracts keywords and synonyms.
const parseResume = async (resume) => {
    const cleanedResume = cleanText(resume);
    const keywordsAndSynonyms = await extractKeywordsAndSynonyms(cleanedResume);
    return keywordsAndSynonyms;
};
//expands a given text by adding synonyms for each word.
const expandWithSynonyms = async (text) => {
    const words = text.split(/\s+/);
    let expandedText = text;

    for (const word of words) {
        const synonyms = await getSynonyms(word);
        expandedText += ' ' + synonyms.join(' ');
    }

    console.log(`Expanded Text: ${expandedText}`); // Log expanded text
    return expandedText;
};

// Before applying TF-IDF, expand the resume and job descriptions
const parseResumeWithSynonyms = async (resumeText) => {
    const expandedResume = await expandWithSynonyms(resumeText);
    return await extractKeywordsAndSynonyms(expandedResume);
};
//cleans up the text by removing extra spaces and trimming it.
const cleanText = (text) => {
    return text
        .replace(/\s+/g, ' ')
        .trim();
};

// ===================== Database Fetch =====================

// Fetch candidates from the database
const getCandidates = async () => {
    const [candidates] = await pool.promise().query('SELECT * FROM users WHERE role = ?', ['candidate']);
    return candidates;
};

// Get detailed information about a candidate, including parsed resume
const getCandidateDetails = async (candidate) => {
    const resumeText = await getResumeContent(candidate.id);
    const parsedResume = await parseResume(resumeText);
    return {
        ...candidate,
        resumeText: parsedResume
    };
};

// Fetch jobs from the database
const getJobs = async () => {
    const [jobs] = await pool.promise().query('SELECT * FROM job');
    return jobs;
};

// Get detailed information about a job, including parsed description
const getJobDetails = async (job) => {
    const parsedDescription = await parseJobDescription(job.description);
    return {
        ...job,
        jobText: parsedDescription
    };
};

// Parse job description text
const parseJobDescription = async (description) => {
    const cleanedDescription = cleanText(description);
    return await extractKeywordsAndSynonyms(cleanedDescription);
};


// ===================== Similarity Calculation =====================
// Function to extract terms from text
const extractTerms = (text) => {
    const terms = tokenizer.tokenize(text.toLowerCase());
    return terms.filter(term => !['a', 'the', 'and', 'in', 'to', 'of', 'for', 'with', 'on', 'at', 'an'].includes(term) && term.length > 2);
};

// Function to calculate cosine similarity where it compares the 2 keyword sets
const calculateCosineSimilarity = (resumeTerms, jobTerms) => {
    if (!Array.isArray(resumeTerms) || !Array.isArray(jobTerms)) {
        throw new Error('Both resumeTerms and jobTerms should be arrays.');
    }

    const resumeTermCount = resumeTerms.length;
    const jobTermCount = jobTerms.length;

    if (resumeTermCount === 0 || jobTermCount === 0) return 0;

    const resumeTermFrequency = {};
    const jobTermFrequency = {};

    resumeTerms.forEach(term => {
        resumeTermFrequency[term] = (resumeTermFrequency[term] || 0) + 1;
    });

    jobTerms.forEach(term => {
        jobTermFrequency[term] = (jobTermFrequency[term] || 0) + 1;
    });

    let dotProduct = 0;
    let resumeMagnitude = 0;
    let jobMagnitude = 0;

    Object.keys(resumeTermFrequency).forEach(term => { //Gets an array of all the terms (keys) 
        if (jobTermFrequency[term]) {
            dotProduct += resumeTermFrequency[term] * jobTermFrequency[term];
        }
        resumeMagnitude += Math.pow(resumeTermFrequency[term], 2);
    });

    Object.values(jobTermFrequency).forEach(frequency => {
        jobMagnitude += Math.pow(frequency, 2);
    });

    resumeMagnitude = Math.sqrt(resumeMagnitude);
    jobMagnitude = Math.sqrt(jobMagnitude);

    return dotProduct / (resumeMagnitude * jobMagnitude);
};

// Function to process and compare resumes to job posts
const compareResumeToJob = (resumeText, jobText) => {
    const resumeTerms = extractTerms(resumeText);
    const jobTerms = extractTerms(jobText);
    
    const similarityScore = calculateCosineSimilarity(resumeTerms, jobTerms);

    console.log(`Similarity Score: ${similarityScore}`); // Log the similarity score

    const threshold = 0.5;
    const isMatch = (score) => score >= threshold;
    if (similarityScore >= threshold) {
        console.log(`Resume matches job post with score: ${similarityScore}`); // Log when a match is found
    } else {
        console.log(`Resume does not match job post with score: ${similarityScore}`); // Log when no match is found
    }
};

// Calculate similarity score between resume and job description
const calculateSimilarity = (resumeContent, jobContent) => {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(resumeContent);
    tfidf.addDocument(jobContent);

    const resumeTerms = tfidf.listTerms(0);
    const jobTerms = tfidf.listTerms(1);

    const resumeVector = resumeTerms.map(term => term.tfidf);
    const jobVector = jobTerms.map(term => term.tfidf);

    const dotProduct = (vecA, vecB) => vecA.reduce((sum, val, i) => sum + (val * (vecB[i] || 0)), 0);
    const magnitude = vec => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

    const resumeMagnitude = magnitude(resumeVector);
    const jobMagnitude = magnitude(jobVector);

    if (resumeMagnitude === 0 || jobMagnitude === 0) {
        return 0;
    }

    const similarity = dotProduct(resumeVector, jobVector) / (resumeMagnitude * jobMagnitude);
    return similarity || 0;
};

const SIMILARITY_THRESHOLD = 0.05; //we can adjust it accordingly

// Check if a candidate matches a job based on similarity score
const matchCandidateToJob = async (candidate, job) => {
    const similarityScore = calculateSimilarity(candidate.resumeText, job.jobText);
    const candidateSalary = parseCandidateSalary(candidate);
    const jobSalary = parseSalaryRange(job.description);

    const salaryMatch = compareSalaryRanges(candidateSalary, jobSalary);
    return similarityScore > SIMILARITY_THRESHOLD && salaryMatch;
};

// ===================== Auto-Apply =====================

// Check if the candidate has already applied for the job
const hasAppliedForJob = async (userId, jobId) => {
    const [rows] = await pool.promise().query(
        'SELECT * FROM jobapplication WHERE user_id = ? AND job_id = ?',
        [userId, jobId]
    );
    return rows.length > 0;
};

const applyForJob = async (userId, jobId, resumeId) => {
    try {
        const hasApplied = await hasAppliedForJob(userId, jobId);
        if (hasApplied) {
            console.log(`Candidate ${userId} has already applied for job ${jobId}.`);
            return;
        }

        await pool.promise().query(
            'INSERT INTO jobapplication (job_id, user_id, resume_id, status) VALUES (?, ?, ?, ?)',
            [jobId, userId, resumeId, 'AppliedS']
        );
        console.log(`Applied for job ${jobId} on behalf of candidate ${userId}`);
        
        await notifyCandidate(userId, jobId);
    } catch (error) {
        console.error(`Error applying for job ${jobId} on behalf of candidate ${userId}:`, error);
    }
};

// function to process and compare resumes to job posts
const processAndCompare = async () => {
    const candidates = await getCandidates();
    const jobs = await getJobs();

    for (const job of jobs) {
        const jobText = await parseJobDescription(job.description);

        for (const candidate of candidates) {
            const resumeText = await getResumeContent(candidate.id);
            const parsedResume = await parseResume(resumeText);

            // Ensure parsedResume and jobText are valid
            const resumeTerms = extractTerms(parsedResume);
            const jobTerms = extractTerms(jobText);

            // Log terms to debug
            console.log('Resume Terms:', resumeTerms);
            console.log('Job Terms:', jobTerms);

            const similarityScore = calculateCosineSimilarity(resumeTerms, jobTerms);
            console.log(`Similarity Score: ${similarityScore}`);

            if (similarityScore >= SIMILARITY_THRESHOLD) {
                console.log(`Candidate ${candidate.id} matches job ${job.id}`);
                const resumeId = await getResumeIdForCandidate(candidate.id);
                if (resumeId) {
                    await applyForJob(candidate.id, job.id, resumeId);
                    console.log(`Applied for job ${job.id} on behalf of candidate ${candidate.id}`);
                }
            } else {
                console.log(`Candidate ${candidate.id} does not match job ${job.id}`);
            }
        }
    }

    // for (const job of jobs) {
    //     const jobSalary = parseSalaryRange(job.description);

    //     for (const candidate of candidates) {
    //         const candidateSalary = parseCandidateSalary(candidate);

    //         if (compareSalaryRanges(candidateSalary, jobSalary)) {
               
    //         }
    //     }
    // }
};

processAndCompare();


// Notify candidate via email
const notifyCandidate = async (userId, jobId) => {
    try {
        // Fetch candidate's details including email and name
        const [[candidate]] = await pool.promise().query('SELECT email, name FROM users WHERE id = ?', [userId]);
        
        // Fetch job details from 'job' table
        const [[job]] = await pool.promise().query('SELECT title, description, salary, location FROM job WHERE id = ?', [jobId]);

        // Ensure both candidate and job exist before sending the email
        if (candidate && job) {
            await sendEmail(candidate, job); // Send email to the candidate
        }
    } catch (error) {
        console.error(`Error notifying candidate ${userId} about job ${jobId}:`, error);
    }
};


// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Use Gmail's SMTP server
    port: 465,              // Use port 465 for secure connection
    secure: true,           // Use SSL
    auth: {
        user: process.env.EMAIL_USERNAME || 'eddiewithme31@gmail.com', // actual email
        pass: process.env.EMAIL_PASSWORD || 'vymn swuq pdub ajta'   //actual password
    }
});



// Test the SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

// Send email notification

const sendEmail = async (candidate, jobDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,  // Sender email address
        to: candidate.email,               // Candidate's email address
        subject: `Job Application for ${jobDetails.title}`, // Subject line
        text: `Hello ${candidate.name},\n\n` +
              `We have automatically applied you for the following job:\n\n` +
              `Title: ${jobDetails.title}\n` +
              `Description: ${jobDetails.description}\n` +
              `Salary: ${jobDetails.salary}\n` +
              `Location: ${jobDetails.location}\n\n` +
              `Someone from the HR or Recruiter's team will reach out to you soon for further status.\n\n` +
              `Best regards,\n` +
              `Your Company`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${candidate.email} for job ${jobDetails.title}`);
    } catch (error) {
        console.error(`Error sending email to ${candidate.email}:`, error);
    }
};



// Batch process candidates for a job
const processedJobs = new Set(); // Local in-memory cache keeps track of jobs that have already been processed to avoid re-processing.
const processedApplications = new Set(); // Local in-memory cache keeps track of job applications that have already been processed.

const isJobProcessed = (jobId) => processedJobs.has(jobId);
const markJobAsProcessed = (jobId) => processedJobs.add(jobId);

const isApplicationProcessed = (candidateId, jobId) => processedApplications.has(`${candidateId}-${jobId}`);
const markApplicationAsProcessed = (candidateId, jobId) => processedApplications.add(`${candidateId}-${jobId}`);

//function processes candidates for a job and applies if there’s a match. It avoids re-processing jobs.
const batchProcessCandidates = async (job, candidates) => {
    if (isJobProcessed(job.id)) {
        console.log(`Job ${job.id} already processed.`); // Log job processing status
        return;
    }

    for (const candidate of candidates) {
        const isMatch = await matchCandidateToJob(candidate, job);
        console.log(`Candidate ${candidate.id} match for job ${job.id}: ${isMatch}`); // Log matching status
        if (isMatch) {
            const resumeId = await getResumeIdForCandidate(candidate.id);
            if (resumeId) {
                await applyForJob(candidate.id, job.id, resumeId);
                console.log(`Applied for job ${job.id} on behalf of candidate ${candidate.id}`); // Log application
            }
        }
    }

    markJobAsProcessed(job.id);
};

// Apply for a job if not already applied
const applyForJobIfNotAlreadyApplied = async (candidate, job) => {
    const resumeId = await getResumeIdForCandidate(candidate.id);
    if (!resumeId) {
        return;
    }

    const hasApplied = await hasAppliedForJob(candidate.id, job.id);
    if (!hasApplied) {
        await applyForJob(candidate.id, job.id, resumeId);
    }
};

// Helper function to split array into chunks
const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

// Auto-apply for existing jobs
const autoApplyJobsForExistingJobs = async () => {
    const startLabel = `autoApplyJobsForExistingJobs_${Date.now()}`;
    console.time(startLabel);

    try {
        const candidates = await getCandidates();
        const jobs = await getJobs();

        for (const job of jobs) {
            const jobId = job.id;
            const jobProcessingLabel = `Processing_job_${jobId}_${Date.now()}`;
            console.time(jobProcessingLabel);

            await batchProcessCandidates(job, candidates);

            console.timeEnd(jobProcessingLabel);
        }
    } catch (error) {
        console.error(`Error in auto-apply for existing jobs: ${error}`); // Error logging
    }

    console.timeEnd(startLabel);
};

// Create a route to trigger auto-apply manually
router.post('/auto-apply-existing', async (req, res) => {
    try {
        await autoApplyJobsForExistingJobs();
        res.send('Auto-apply for existing jobs and candidates completed.');
    } catch (error) {
        res.status(500).send('Error processing auto-apply for existing jobs.');
    }
});

// Auto-apply for a new job when it is added
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
                await applyForJobIfNotAlreadyApplied(candidateDetails, jobDetails);
            }
        }
    } catch (error) {
        res.status(500).send('Error applying.');
};

// Route to create a new job and auto-apply for it
router.post('/jobs', async (req, res) => {
    const { description, title, ...jobDetails } = req.body;

    try {
        const sql = 'INSERT INTO job (title, description, ...) VALUES (?, ?, ...)'; // Complete SQL with actual job fields
        const [result] = await pool.promise().query(sql, [title, description, ...jobDetails]);

        const newJobId = result.insertId;

        // Trigger auto-apply for all candidates when a new job is added
        await autoApplyJobsForNewJob(newJobId);

        res.status(201).send('Job posted and auto-applied to candidates.');
    } catch (error) {
        res.status(500).send('Error creating job.');
    }
});

// Schedule job to run every 10 seconds (or adjust as needed)
cron.schedule('*/10 * * * * *', async () => {
    try {
        await autoApplyJobsForExistingJobs();
    } catch (error) {
        res.status(500).send('Error scheduling.');
    }
});

// //function to get synonyms using Datamuse API
// const getSynonyms = async (word) => {
//     try {
//         const response = await axios.get(`https://api.datamuse.com/words?rel_syn=${word}`);
//         return response.data.map(entry => entry.word);
//     } catch (error) {
//         return [];
//     }
// };

// // Example function to parse experience level from job description
// const parseExperienceLevel = (description) => {
//     // Example implementation to extract experience level from job description
//     if (description.includes('junior')) return 'junior';
//     if (description.includes('mid-level')) return 'mid-level';
//     if (description.includes('senior')) return 'senior';
//     return 'unspecified';
// };

// // Example function to compare experience levels
// const compareExperienceLevels = (candidateExperience, jobExperience) => {
//     // Example implementation to compare experience levels
//     const levels = ['junior', 'mid-level', 'senior'];
//     return levels.indexOf(candidateExperience) >= levels.indexOf(jobExperience);
// };

// // Function to extract salary range from job description
// const parseSalaryRange = (description) => {
//     const salaryRegex = /\$([0-9,]+) - \$([0-9,]+)/;
//     const match = description.match(salaryRegex);
//     if (match) {
//         return {
//             min: parseInt(match[1].replace(/,/g, ''), 10),
//             max: parseInt(match[2].replace(/,/g, ''), 10)
//         };
//     }
//     return { min: null, max: null };
// };

// // Example function to extract salary expectations from candidate profile
// const parseCandidateSalary = (candidateProfile) => {
//     if (!candidateProfile || !candidateProfile.salaryExpectation) {
//         return { min: null, max: null };
//     }
    
//     const salaryRegex = /\$([0-9,]+) - \$([0-9,]+)/;
//     const match = candidateProfile.salaryExpectation.match(salaryRegex);
//     if (match) {
//         return {
//             min: parseInt(match[1].replace(/,/g, ''), 10),
//             max: parseInt(match[2].replace(/,/g, ''), 10)
//         };
//     }
//     return { min: null, max: null };
// };


// // Function to compare salary ranges
// const compareSalaryRanges = (candidateSalary, jobSalary) => {
//     if (!candidateSalary.min || !candidateSalary.max || !jobSalary.min || !jobSalary.max) {
//         return false;
//     }

//     return (candidateSalary.min <= jobSalary.max) && (candidateSalary.max >= jobSalary.min);
// };
}
module.exports = router;
