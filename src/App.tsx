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

function App() {
    const { currentUser, initAuthListener } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth listener on app start
    useEffect(() => {
        initAuthListener();

        // Simulate a small delay for auth to initialize
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [initAuthListener]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
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
                            currentUser.uid ? (
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
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            currentUser.uid ? (
                                <Profile />
                            ) : (
                                <Navigate to="/login" replace />
                            )
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