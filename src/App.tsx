import React from 'react';
import { EditorProvider } from './components/editor/EditorContext';
import Ribbon from './components/layout/Ribbon';
import Sidebar from './components/layout/Sidebar';
import RichTextEditor from './components/editor/RichTextEditor';
import StatusBar from './components/layout/StatusBar';

function App() {
    return (
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
    );
}

export default App;