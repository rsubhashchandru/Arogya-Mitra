import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import Register from './pages/Register';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import HealthAssistant from './pages/HealthAssistant';
import DoctorDashboard from './pages/DoctorDashboard';
import MedicineReminder from './pages/MedicineReminder';
import PrescriptionOCR from './pages/PrescriptionOCR';
import PregnancyModule from './pages/PregnancyModule';
import FamilySystem from './pages/FamilySystem';
import Messages from './pages/Messages';
import MyPrescriptions from './pages/MyPrescriptions';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const { i18n } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleLanguageChange = async (lang) => {
    if (isLoggedIn) {
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          onLogout={handleLogout}
          onLanguageChange={handleLanguageChange}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={isLoggedIn ? <Doctors /> : <Navigate to="/login" />} />
            <Route path="/health-assistant" element={<HealthAssistant />} />
            <Route path="/pregnancy" element={<PregnancyModule />} />
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/" /> : <Register setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/appointments"
              element={isLoggedIn ? <Appointments /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
            />
            <Route
              path="/doctor-dashboard"
              element={isLoggedIn && user.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/medicine"
              element={isLoggedIn ? <MedicineReminder /> : <Navigate to="/login" />}
            />
            <Route
              path="/prescription-scan"
              element={isLoggedIn ? <PrescriptionOCR /> : <Navigate to="/login" />}
            />
            <Route
              path="/family"
              element={isLoggedIn ? <FamilySystem /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={isLoggedIn ? <Messages /> : <Navigate to="/login" />}
            />
            <Route
              path="/my-prescriptions"
              element={isLoggedIn ? <MyPrescriptions /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
