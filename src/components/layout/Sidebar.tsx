import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useEditorContext } from '../editor/EditorContext';
import { Plus, Trash2, FileText, Lightbulb, Search, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
    const {
        sidebarOpen,
        ideas,
        addIdea,
        deleteIdea,
        documents,
        currentDocumentId,
        createDocument,
        openDocument
    } = useAppStore();
    const { editor } = useEditorContext();
    const [activeTab, setActiveTab] = useState<'ideas' | 'docs'>('ideas');
    const [searchQuery, setSearchQuery] = useState('');

    if (!sidebarOpen) return null;

    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddIdea = () => {
        const title = prompt('Idea Title:');
        if (!title) return;
        const content = prompt('Idea Content:');
        if (!content) return;
        addIdea(title, content);
    };

    const handleCreateDoc = () => {
        const title = prompt('Document Title:');
        if (title) createDocument(title);
    };

    const insertIdea = (content: string) => {
        if (editor) {
            editor.chain().focus().insertContent(content).run();
        }
    };

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-300 flex flex-col h-full shadow-inner z-0">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-300 bg-gray-100">
                <button
                    className={clsx(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2",
                        activeTab === 'ideas' ? "bg-white text-slate-800 border-b-2 border-slate-800" : "text-gray-600 hover:bg-gray-200"
                    )}
                    onClick={() => setActiveTab('ideas')}
                >
                    <Lightbulb size={16} />
                    Ideas
                </button>
                <button
                    className={clsx(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2",
                        activeTab === 'docs' ? "bg-white text-slate-800 border-b-2 border-slate-800" : "text-gray-600 hover:bg-gray-200"
                    )}
                    onClick={() => setActiveTab('docs')}
                >
                    <FileText size={16} />
                    Documents
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200 bg-white">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder={activeTab === 'ideas' ? "Search ideas..." : "Search documents..."}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeTab === 'ideas' && (
                    <>
                        <button
                            onClick={handleAddIdea}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-slate-500 hover:text-slate-500 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            Add New Idea
                        </button>

                        {filteredIdeas.map((idea) => (
                            <div key={idea.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-800 text-sm">{idea.title}</h3>
                                    <button
                                        onClick={() => deleteIdea(idea.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-3 mb-3">{idea.content}</p>
                                <button
                                    onClick={() => insertIdea(idea.content)}
                                    className="w-full py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded hover:bg-slate-100 transition-colors"
                                >
                                    Insert into Document
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'docs' && (
                    <>
                        <button
                            onClick={handleCreateDoc}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-slate-500 hover:text-slate-500 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            New Document
                        </button>

                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => openDocument(doc.id)}
                                className={clsx(
                                    "p-3 rounded border cursor-pointer transition-all",
                                    currentDocumentId === doc.id
                                        ? "bg-slate-50 border-slate-300 shadow-sm"
                                        : "bg-white border-gray-200 hover:border-slate-300"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className={currentDocumentId === doc.id ? "text-slate-700" : "text-gray-400"} />
                                    <span className={clsx("text-sm font-medium", currentDocumentId === doc.id ? "text-slate-900" : "text-gray-700")}>
                                        {doc.title}
                                    </span>
                                </div>
                                <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                                    <span>Last modified: {new Date(doc.lastModified).toLocaleDateString()}</span>
                                    {doc.versions.length > 0 && (
                                        <span className="bg-gray-100 px-1.5 rounded text-gray-500">{doc.versions.length} versions</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;