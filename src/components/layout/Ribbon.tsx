import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useEditorContext } from '../editor/EditorContext';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, Image as ImageIcon, Sidebar, FileText,
    Undo, Redo, Save, User, Feather, FilePlus, FolderOpen, Download, LogOut, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

const Ribbon: React.FC = () => {
    const { activeRibbonTab, setActiveRibbonTab, toggleSidebar, sidebarOpen, saveVersion, currentUser, createDocument } = useAppStore();
    const { editor } = useEditorContext();

    if (!editor) return null;

    const isActive = (name: string, attributes?: any) => editor.isActive(name, attributes);

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        label
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        label: string;
    }) => (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 min-w-[50px] h-[60px] text-xs gap-1 transition-colors",
                isActive ? "bg-slate-100 text-slate-900 border-b-2 border-slate-800" : "text-gray-700"
            )}
            title={label}
        >
            {children}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );

    const Separator = () => <div className="w-px h-10 bg-gray-300 mx-2" />;

    return (
        <div className="flex flex-col w-full bg-white border-b border-gray-300 shadow-sm z-10">
            {/* Ribbon Tabs */}
            <div className="flex bg-slate-800 text-white px-2 justify-between items-center">
                <div className="flex items-center">
                    {/* Logo / Home Button */}
                    <button
                        className="mr-4 p-1 hover:bg-slate-700 rounded-full transition-colors"
                        onClick={() => window.location.reload()} // Mock "Home" action
                        title="Go Home"
                    >
                        <Feather size={20} className="text-white" />
                    </button>

                    <button
                        className={clsx("px-4 py-1 text-sm hover:bg-slate-700 transition-colors", activeRibbonTab === 'file' && "bg-white text-slate-800 font-semibold rounded-t-md mt-1")}
                        onClick={() => setActiveRibbonTab('file')}
                    >
                        File
                    </button>
                    <button
                        className={clsx("px-4 py-1 text-sm hover:bg-slate-700 transition-colors", activeRibbonTab === 'home' && "bg-white text-slate-800 font-semibold rounded-t-md mt-1")}
                        onClick={() => setActiveRibbonTab('home')}
                    >
                        Home
                    </button>
                    <button
                        className={clsx("px-4 py-1 text-sm hover:bg-slate-700 transition-colors", activeRibbonTab === 'insert' && "bg-white text-slate-800 font-semibold rounded-t-md mt-1")}
                        onClick={() => setActiveRibbonTab('insert')}
                    >
                        Insert
                    </button>
                    <button
                        className={clsx("px-4 py-1 text-sm hover:bg-slate-700 transition-colors", activeRibbonTab === 'view' && "bg-white text-slate-800 font-semibold rounded-t-md mt-1")}
                        onClick={() => setActiveRibbonTab('view')}
                    >
                        View
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer transition-colors" title="User Profile">
                    <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold border border-slate-500">
                        {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full" />
                        ) : (
                            <User size={14} />
                        )}
                    </div>
                    <span className="text-xs font-medium">{currentUser?.name || 'Guest'}</span>
                    <ChevronDown size={12} className="text-slate-400" />
                </div>
            </div>

            {/* Ribbon Toolbar */}
            <div className="flex items-center px-4 py-2 h-24 bg-gray-50 overflow-x-auto">
                {activeRibbonTab === 'file' && (
                    <>
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => {
                                    const title = prompt('New Document Title:');
                                    if (title) createDocument(title);
                                }}
                                label="New"
                            >
                                <FilePlus size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => {
                                    if (!sidebarOpen) toggleSidebar();
                                    // Ideally switch sidebar tab to 'docs'
                                }}
                                label="Open"
                            >
                                <FolderOpen size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => {
                                    const desc = window.prompt('Version description (e.g., "Draft 1 complete")');
                                    if (desc) saveVersion(desc);
                                }}
                                label="Save"
                            >
                                <Save size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => alert('Export feature coming soon!')}
                                label="Export"
                            >
                                <Download size={20} />
                            </ToolbarButton>
                        </div>
                    </>
                )}

                {activeRibbonTab === 'home' && (
                    <>
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().undo().run()}
                                label="Undo"
                            >
                                <Undo size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().redo().run()}
                                label="Redo"
                            >
                                <Redo size={20} />
                            </ToolbarButton>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                isActive={isActive('bold')}
                                label="Bold"
                            >
                                <Bold size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                isActive={isActive('italic')}
                                label="Italic"
                            >
                                <Italic size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                isActive={isActive('underline')}
                                label="Underline"
                            >
                                <Underline size={20} />
                            </ToolbarButton>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                isActive={isActive('textAlign', { textAlign: 'left' })}
                                label="Left"
                            >
                                <AlignLeft size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                isActive={isActive('textAlign', { textAlign: 'center' })}
                                label="Center"
                            >
                                <AlignCenter size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                isActive={isActive('textAlign', { textAlign: 'right' })}
                                label="Right"
                            >
                                <AlignRight size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                isActive={isActive('textAlign', { textAlign: 'justify' })}
                                label="Justify"
                            >
                                <AlignJustify size={20} />
                            </ToolbarButton>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                isActive={isActive('heading', { level: 1 })}
                                label="Title"
                            >
                                <Heading1 size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={isActive('heading', { level: 2 })}
                                label="Heading"
                            >
                                <Heading2 size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                isActive={isActive('heading', { level: 3 })}
                                label="Subhead"
                            >
                                <Heading3 size={20} />
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => editor.chain().focus().setParagraph().run()}
                                isActive={isActive('paragraph')}
                                label="Normal"
                            >
                                <FileText size={20} />
                            </ToolbarButton>
                        </div>
                    </>
                )}

                {activeRibbonTab === 'insert' && (
                    <>
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={() => {
                                    const url = window.prompt('Enter image URL');
                                    if (url) {
                                        editor.chain().focus().setImage({ src: url }).run();
                                    }
                                }}
                                label="Image"
                            >
                                <ImageIcon size={20} />
                            </ToolbarButton>
                        </div>
                    </>
                )}

                {activeRibbonTab === 'view' && (
                    <>
                        <div className="flex items-center space-x-1">
                            <ToolbarButton
                                onClick={toggleSidebar}
                                isActive={sidebarOpen}
                                label="Ideas"
                            >
                                <Sidebar size={20} />
                            </ToolbarButton>
                        </div>
                    </>
                )}

                <div className="flex-1" />
                <div className="flex items-center space-x-1 border-l pl-2">
                    <ToolbarButton
                        onClick={() => {
                            const desc = window.prompt('Version description (e.g., "Draft 1 complete")');
                            if (desc) saveVersion(desc);
                        }}
                        label="Save Ver"
                    >
                        <Save size={20} />
                    </ToolbarButton>
                </div>
            </div>
        </div>
    );
};

export default Ribbon;