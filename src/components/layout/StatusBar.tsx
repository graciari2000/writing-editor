import React, { useState, useEffect } from 'react';
import { useEditorContext } from '../editor/EditorContext';
import {
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    RefreshCw,
    Save
} from 'lucide-react';

const StatusBar: React.FC = () => {
    const { editor } = useEditorContext();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [lastSaved, setLastSaved] = useState<string>('');

    // Update counts whenever editor content changes
    useEffect(() => {
        if (!editor) return;

        const updateCounts = () => {
            const words = editor.storage.characterCount?.words?.() || 0;
            const chars = editor.storage.characterCount?.characters?.() || 0;
            setWordCount(words);
            setCharCount(chars);
        };

        // Initial update
        updateCounts();

        // Subscribe to updates
        editor.on('update', updateCounts);
        editor.on('selectionUpdate', updateCounts);

        return () => {
            editor.off('update', updateCounts);
            editor.off('selectionUpdate', updateCounts);
        };
    }, [editor]);

    // Update last saved time
    useEffect(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSaved(`Last saved: ${timeString}`);

        const interval = setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSaved(`Last saved: ${timeString}`);
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Toggle full screen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Toggle focus mode
    const toggleFocusMode = () => {
        const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
        if (!editorElement) return;

        setIsFocusMode(!isFocusMode);

        if (!isFocusMode) {
            // Enter focus mode
            document.body.classList.add('focus-mode');
            editorElement.classList.add('focus-mode-active');

            // Hide other elements
            document.querySelectorAll('.ribbon, .sidebar, .status-bar').forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });
        } else {
            // Exit focus mode
            document.body.classList.remove('focus-mode');
            editorElement.classList.remove('focus-mode-active');

            // Show other elements
            document.querySelectorAll('.ribbon, .sidebar, .status-bar').forEach(el => {
                (el as HTMLElement).style.display = '';
            });
        }
    };

    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Handle ESC key to exit focus mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFocusMode) {
                toggleFocusMode();
            }
        };

        if (isFocusMode) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFocusMode]);

    if (!editor) {
        return null;
    }

    // Format word count with commas
    const formattedWordCount = wordCount.toLocaleString();
    const formattedCharCount = charCount.toLocaleString();

    return (
        <div className="status-bar h-8 bg-slate-800 text-white flex items-center px-4 text-xs justify-between select-none border-t border-slate-700">
            <div className="flex space-x-4 items-center">
                {/* Document stats */}
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-slate-700 px-2 py-1 rounded">
                        <span className="text-green-400">✓</span>
                        <span className="text-xs">{lastSaved}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                        <span className="text-blue-300">{formattedWordCount}</span>
                        <span className="text-slate-400 text-xs">words</span>
                    </div>

                    <div className="flex items-center space-x-1">
                        <span className="text-purple-300">{formattedCharCount}</span>
                        <span className="text-slate-400 text-xs">chars</span>
                    </div>

                    {/* Page indicator */}
                    <div className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded">
                        <span className="text-xs">Page</span>
                        <span className="font-bold">1</span>
                        <span className="text-slate-400">/</span>
                        <span>1</span>
                    </div>
                </div>
            </div>

            <div className="flex space-x-2 items-center">
                {/* Language selector */}
                <div className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded cursor-pointer hover:bg-slate-600 transition-colors">
                    <span className="text-xs">English (US)</span>
                    <span className="text-slate-400 text-xs">▼</span>
                </div>

                {/* Auto-save indicator */}
                <div className="flex items-center space-x-1 px-2 py-1 rounded bg-green-900/30 text-green-300">
                    <RefreshCw size={10} />
                    <span className="text-xs">Auto-save</span>
                </div>

                {/* Focus Mode Button */}
                <button
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-xs"
                    onClick={toggleFocusMode}
                    title={isFocusMode ? "Exit Focus Mode (ESC)" : "Enter Focus Mode"}
                >
                    {isFocusMode ? (
                        <>
                            <EyeOff size={12} />
                            <span>Exit Focus</span>
                        </>
                    ) : (
                        <>
                            <Eye size={12} />
                            <span>Focus Mode</span>
                        </>
                    )}
                </button>

                {/* Full Screen Button */}
                <button
                    className="flex items-center space-x-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-xs"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
                >
                    {isFullscreen ? (
                        <>
                            <Minimize2 size={12} />
                            <span>Exit Full</span>
                        </>
                    ) : (
                        <>
                            <Maximize2 size={12} />
                            <span>Full Screen</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StatusBar;