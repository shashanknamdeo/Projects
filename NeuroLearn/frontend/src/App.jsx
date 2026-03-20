import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyPlanCreator from './pages/StudyPlanCreator';
import LessonSession from './pages/LessonSession';
import StudySession from './pages/StudySession';
import QuizSession from './pages/QuizSession';
import UserProfile from './pages/UserProfile';
import Onboarding from './pages/Onboarding';
import StudyPlanDetail from './pages/StudyPlanDetail';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-900 text-white font-sans">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/onboarding" element={
                        <PrivateRoute>
                            <Onboarding />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/plan/:id" element={
                        <PrivateRoute>
                            <StudyPlanDetail />
                        </PrivateRoute>
                    } />
                    <Route path="/create-plan" element={
                        <PrivateRoute>
                            <StudyPlanCreator />
                        </PrivateRoute>
                    } />
                    <Route path="/lesson/:id" element={
                        <PrivateRoute>
                            <LessonSession />
                        </PrivateRoute>
                    } />
                    <Route path="/session/:id" element={
                        <PrivateRoute>
                            <StudySession />
                        </PrivateRoute>
                    } />
                    <Route path="/quiz" element={
                        <PrivateRoute>
                            <QuizSession />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <UserProfile />
                        </PrivateRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
