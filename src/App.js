import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignInModal from './pages/SignInModal';
import RegisterFom from './pages/RegisterForm';
import CandidatePage from './pages/CandidatePage';
import RecruiterPage from './pages/RecruiterPage.js';
import AdminPage from './pages/AdminPage';
import UserManagement from './pages/UserManagement.js';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import CandidateProfile from './pages/CandidateProfile.js';
import AboutUs from './pages/AboutUs.js';
import OurJobs from './pages/OurJobs.js'
import ManageJobs from './pages/ManageJobs.js';
import CandidateResume from './pages/CandidateResume.js';
import CandidateExperience from './pages/CandidateExperience.js';
import CandidateEducation from './pages/CandidateEducation.js';
import CandidateSkills from './pages/CandidateSkills.js';
import CandidateJob from './pages/CandidateJob.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<HomePage />} />
          <Route exact path='/signin' element={<SignInModal />} />
          <Route exact path='/registerform' element={<RegisterFom />} />
          <Route path="/candidate" element={<CandidatePage />} />
        <Route path="/recruiter" element={<RecruiterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<UserManagement />} /> 
        <Route path='/recruiter' element={<RecruiterPage />} />
        <Route path="/recruiter/jobs" element={<JobList />} />
        <Route path="/recruiter/jobs/new" element={<JobForm />} />
        <Route path="/candidate/new" element={<CandidateProfile />} />
        <Route path='/about' element={< AboutUs/>} />
        <Route path="/jobs" element= { < OurJobs />} />
        <Route path="/admin/jobs" element={< ManageJobs />} />
        <Route path="/candidate/resume" element={< CandidateResume />} />
        <Route path="/candidate/experience" element={< CandidateExperience />} />
        <Route path="/candidate/education" element={< CandidateEducation />} />
        <Route path="/candidate/skills" element={< CandidateSkills />} />
        <Route path="/candidate/jobs" element={< CandidateJob />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
