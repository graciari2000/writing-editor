import React from 'react';
import { useEditorContext } from '../editor/EditorContext';

const StatusBar: React.FC = () => {
    const { editor } = useEditorContext();

    if (!editor) return null;

    const wordCount = editor.storage.characterCount?.words?.() || 0;
    const charCount = editor.storage.characterCount?.characters?.() || 0;

    return (
        <div className="h-8 bg-slate-800 text-white flex items-center px-4 text-xs justify-between select-none border-t border-slate-700">
            <div className="flex space-x-4 items-center">
                <span className="px-2 py-1 bg-slate-700 rounded text-xs">Page 1 of 1</span>
                <div className="flex space-x-2">
                    <span>{wordCount} words</span>
                    <span className="text-slate-400">|</span>
                    <span>{charCount} characters</span>
                </div>
            </div>
            <div className="flex space-x-4 items-center">
                <span className="px-2 py-1 bg-slate-700 rounded">English (US)</span>
                <button
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-xs"
                    onClick={() => {
                        // Toggle focus mode - you can implement this later
                        document.body.classList.toggle('focus-mode');
                    }}
                >
                    Focus Mode
                </button>
            </div>
        </div>
    );
};

export default StatusBar;