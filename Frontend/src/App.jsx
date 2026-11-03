// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import AnalysisDetail from './pages/AnalysisDetail'; // ✅ Import the new page
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const { user, loading } = useAuth();
    const location = useLocation(); // ✅ Need this for AnimatePresence key

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {user && <Navigation />}

            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Routes>
                        <Route path="/login" element={
                            user ? <Navigate to="/" /> : <Login />
                        } />
                        <Route path="/register" element={
                            user ? <Navigate to="/" /> : <Register />
                        } />
                        <Route path="/" element={
                            user ? <Dashboard /> : <Navigate to="/login" />
                        } />
                        <Route path="/history" element={
                            user ? <History /> : <Navigate to="/login" />
                        } />
                        
                        {/* ✅ NEW ROUTE for viewing a single analysis */}
                        <Route path="/analysis/:id" element={
                            user ? <AnalysisDetail /> : <Navigate to="/login" />
                        } />
                        
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default App;