import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppStore } from './store/useAppStore';
import { EditorProvider } from './components/editor/EditorContext';
import Ribbon from './components/layout/Ribbon';
import Sidebar from './components/layout/Sidebar';
import RichTextEditor from './components/editor/RichTextEditor';
import StatusBar from './components/layout/StatusBar';
import Login from './components/Login';
import Profile from "./components/layout/Profile";

function App() {
    const { currentUser } = useAppStore();

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        currentUser.name === "Guest" ? (
                            <Login />
                        ) : (
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
                        )
                    }
                />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;