import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { useAppStore } from '../../store/useAppStore';
import { useEditorContext } from './EditorContext';

// Create a proper PageBreak extension
const PageBreakExtension = {
    name: 'pageBreak',

    addCommands() {
        return {
            insertPageBreak: () => ({ chain }) => {
                return chain()
                    .setHorizontalRule()
                    .run();
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => this.editor.commands.insertPageBreak(),
        };
    },
};

const RichTextEditor: React.FC = () => {
    const { currentDocumentId, documents, updateCurrentDocument } = useAppStore();
    const { setEditor } = useEditorContext();
    const previousDocIdRef = useRef<string | null>(null);

    const currentDoc = documents.find((d) => d.id === currentDocumentId);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your novel...',
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            CharacterCount.configure({
                limit: null,
            }),
            HorizontalRule.configure({
                HTMLAttributes: {
                    class: 'page-break',
                },
            }),
            PageBreakExtension, // Add our page break extension
        ],
        content: currentDoc?.content || '',
        onUpdate: ({ editor }) => {
            updateCurrentDocument(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none',
            },
        },
    });

    // Handle document switching
    useEffect(() => {
        if (editor && currentDoc) {
            if (previousDocIdRef.current !== currentDocumentId) {
                editor.commands.setContent(currentDoc.content, false);
                previousDocIdRef.current = currentDocumentId;
            }
        }
    }, [currentDocumentId, currentDoc, editor]);

    // Update editor context
    useEffect(() => {
        setEditor(editor);
        return () => setEditor(null);
    }, [editor, setEditor]);

    // Function to insert page break (for local use)
    const insertPageBreak = () => {
        if (!editor) return;
        editor.chain().focus().setHorizontalRule().run();
    };

    // Add keyboard shortcut for page break (Ctrl/Cmd + Enter)
    useEffect(() => {
        if (!editor) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                insertPageBreak();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor]);

    if (!editor) {
        return (
            <div className="flex-1 bg-gray-100 overflow-y-auto h-full p-8 flex justify-center items-center">
                <div className="w-full max-w-[816px]">
                    <div className="bg-white p-8 rounded shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-100 overflow-y-auto h-full py-8 flex justify-center">
            <div className="w-full max-w-[816px]">
                {/* Page container */}
                <div className="relative">
                    {/* Page shadow effect */}
                    <div className="page-shadow"></div>

                    {/* Actual page */}
                    <div className="editor-page-container">
                        <EditorContent editor={editor} />

                        {/* Page number (optional) */}
                        <div className="page-number">
                            Page 1
                        </div>
                    </div>
                </div>

                {/* Toolbar for page controls */}
                <div className="flex justify-center items-center space-x-4 mt-8 hide-in-focus-mode">
                    <button
                        onClick={insertPageBreak}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                        title="Insert Page Break (Ctrl/Cmd + Enter)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Page Break</span>
                    </button>

                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Tip:</span> Use{" "}
                        <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs font-mono">Ctrl/Cmd</kbd>
                        {" "}+{" "}
                        <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs font-mono">Enter</kbd>
                        {" "}for page breaks
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RichTextEditor;