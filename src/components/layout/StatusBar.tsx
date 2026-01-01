import React from 'react';
import { useEditorContext } from '../editor/EditorContext';

const StatusBar: React.FC = () => {
    const { editor } = useEditorContext();

    if (!editor) return null;

    const wordCount = editor.storage.characterCount?.words?.() || 0;
    // Tiptap starter kit doesn't include characterCount by default, need to check extensions.
    // Actually, I didn't install character-count extension.
    // I'll just use a simple text length approximation for now or install it.
    // Let's just use textContent length for now.

    const text = editor.getText();
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;

    return (
        <div className="h-6 bg-slate-800 text-white flex items-center px-4 text-xs justify-between select-none">
            <div className="flex space-x-4">
                <span>Page 1 of 1</span>
                <span>{words} words</span>
                <span>{chars} characters</span>
            </div>
            <div className="flex space-x-4">
                <span>English (US)</span>
                <span>Focus Mode</span>
            </div>
        </div>
    );
};

export default StatusBar;