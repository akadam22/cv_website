import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignInModal from './pages/SignInModal';
import RegisterFom from './pages/RegisterForm';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<HomePage />} />
          <Route exact path='/signin' element={<SignInModal />} />
          <Route exact path='/registerform' element={<RegisterFom />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
