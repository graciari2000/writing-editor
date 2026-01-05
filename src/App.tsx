import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { EditorProvider } from './components/editor/EditorContext';
import Ribbon from './components/layout/Ribbon';
import Sidebar from './components/layout/Sidebar';
import RichTextEditor from './components/editor/RichTextEditor';
import StatusBar from './components/layout/StatusBar';
import Login from './components/Login';
import Profile from "./components/layout/Profile";
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    const { currentUser, initAuthListener, isLoading } = useAppStore();
    const [authChecked, setAuthChecked] = useState(false);

    // Initialize auth listener on app start
    useEffect(() => {
        const unsubscribe = initAuthListener();
        setAuthChecked(true);

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [initAuthListener]);

    // Show loading state while checking auth
    if (isLoading || !authChecked) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Initializing application...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 2000,
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <EditorProvider>
                                    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 font-sans text-gray-900">
                                        {/* Top Ribbon */}
                                        <Ribbon />

                                        {/* Main Workspace */}
                                        <div className="flex flex-1 overflow-hidden relative">
                                            {/* Left Sidebar (Idea Database) */}
                                            <Sidebar />

                                            {/* Center Editor */}
                                            <RichTextEditor />
                                        </div>

                                        {/* Bottom Status Bar */}
                                        <StatusBar />
                                    </div>
                                </EditorProvider>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;