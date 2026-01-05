import React, { useState, useEffect } from 'react';
import { useEditorContext } from '../editor/EditorContext';
import {
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    RefreshCw,
    Printer,
    ChevronLeft,
    ChevronRight,
    Plus
} from 'lucide-react';

const StatusBar: React.FC = () => {
    const { editor } = useEditorContext();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastSaved, setLastSaved] = useState<string>('');
    const [pageCount, setPageCount] = useState(1);

    // Calculate page breaks and update page count
    const updatePageCount = () => {
        if (!editor) return;

        const content = editor.getHTML();
        // Count page breaks + 1 for the first page
        const pageBreaks = (content.match(/page-break/g) || []).length;
        setPageCount(pageBreaks + 1);

        // Update total pages
        setTotalPages(pageBreaks + 1);
    };

    // Update counts and page info
    useEffect(() => {
        if (!editor) return;

        const updateAll = () => {
            // Update word count
            let words = 0;
            let chars = 0;

            if (editor.storage.characterCount?.words) {
                words = editor.storage.characterCount.words();
                chars = editor.storage.characterCount.characters();
            } else {
                const text = editor.getText();
                words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
                chars = text.length;
            }

            setWordCount(words);
            setCharCount(chars);

            // Update page count
            updatePageCount();
        };

        // Initial update
        updateAll();

        // Subscribe to updates
        editor.on('update', updateAll);
        editor.on('selectionUpdate', updateAll);

        return () => {
            editor.off('update', updateAll);
            editor.off('selectionUpdate', updateAll);
        };
    }, [editor]);

    // Update last saved time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSaved(timeString);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);

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
        setIsFocusMode(!isFocusMode);

        if (!isFocusMode) {
            document.body.classList.add('focus-mode');
            const editorElement = document.querySelector('.ProseMirror');
            if (editorElement) {
                editorElement.classList.add('focus-mode-active');
            }

            document.querySelectorAll('.ribbon, .sidebar, .status-bar').forEach(el => {
                (el as HTMLElement).style.opacity = '0';
                (el as HTMLElement).style.pointerEvents = 'none';
            });
        } else {
            document.body.classList.remove('focus-mode');
            const editorElement = document.querySelector('.ProseMirror');
            if (editorElement) {
                editorElement.classList.remove('focus-mode-active');
            }

            document.querySelectorAll('.ribbon, .sidebar, .status-bar').forEach(el => {
                (el as HTMLElement).style.opacity = '';
                (el as HTMLElement).style.pointerEvents = '';
            });
        }
    };

    // Navigate to page
    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);

        // Scroll to page (simplified - in real app you'd calculate position)
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement) {
            editorElement.scrollTo({
                top: (page - 1) * window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    // Add page break
    const addPageBreak = () => {
        if (!editor) return;
        editor.commands.insertPageBreak();
        setCurrentPage(totalPages + 1);
    };

    // Print document
    const printDocument = () => {
        window.print();
    };

    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Handle ESC key to exit focus mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFocusMode) {
                toggleFocusMode();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFocusMode]);

    if (!editor) {
        return null;
    }

    return (
        <div className="status-bar h-8 bg-slate-800 text-white flex items-center px-4 text-xs justify-between select-none border-t border-slate-700">
            <div className="flex space-x-4 items-center">
                {/* Document stats */}
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-slate-700 px-2 py-1 rounded">
                        <RefreshCw size={10} className="text-green-400" />
                        <span className="text-xs">{lastSaved}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded">
                            <span className="text-blue-300 font-medium">{wordCount.toLocaleString()}</span>
                            <span className="text-slate-400 text-xs">words</span>
                        </div>

                        <div className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded">
                            <span className="text-purple-300 font-medium">{charCount.toLocaleString()}</span>
                            <span className="text-slate-400 text-xs">chars</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 items-center">
                {/* Page Navigation */}
                <div className="flex items-center space-x-2 bg-slate-700 px-2 py-1 rounded">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous Page"
                    >
                        <ChevronLeft size={12} />
                    </button>

                    <div className="flex items-center space-x-1 px-2">
                        <span className="font-medium">Page</span>
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                            min={1}
                            max={totalPages}
                            className="w-10 bg-slate-800 text-center rounded px-1 py-0.5 text-xs"
                        />
                        <span className="text-slate-400">of</span>
                        <span className="font-medium">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next Page"
                    >
                        <ChevronRight size={12} />
                    </button>

                    <button
                        onClick={addPageBreak}
                        className="p-1 hover:bg-slate-600 rounded ml-2"
                        title="Add Page Break"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                {/* Print Button */}
                <button
                    onClick={printDocument}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-xs"
                    title="Print Document"
                >
                    <Printer size={12} />
                    <span>Print</span>
                </button>

                {/* Language selector */}
                <div className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded cursor-pointer hover:bg-slate-600 transition-colors">
                    <span className="text-xs">English (US)</span>
                    <span className="text-slate-400 text-xs">▼</span>
                </div>

                {/* Focus Mode Button */}
                <button
                    className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${isFocusMode
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
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
                    className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs ${isFullscreen
                            ? 'bg-purple-700 hover:bg-purple-800'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
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