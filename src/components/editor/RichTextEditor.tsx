import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count'; // Add this import
import { useAppStore } from '../../store/useAppStore';
import { useEditorContext } from './EditorContext';

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
            CharacterCount.configure({ // Add this extension
                limit: null, // No character limit
            }),
        ],
        content: currentDoc?.content || '',
        onUpdate: ({ editor }) => {
            updateCurrentDocument(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[800px] px-8 py-10 bg-white shadow-sm mx-auto my-4 border border-gray-200',
            },
        },
    });

    // Handle document switching properly
    useEffect(() => {
        if (editor && currentDoc) {
            if (previousDocIdRef.current !== currentDocumentId) {
                // Save cursor position before changing content
                const selection = editor.state.selection;
                const wasEmpty = editor.isEmpty;

                // Set new content
                editor.commands.setContent(currentDoc.content, false);

                // Try to restore cursor position if possible
                if (!wasEmpty && selection.from <= editor.state.doc.content.size) {
                    setTimeout(() => {
                        editor.commands.setTextSelection(Math.min(selection.from, editor.state.doc.content.size));
                    }, 0);
                }

                previousDocIdRef.current = currentDocumentId;
            }
        }
    }, [currentDocumentId, currentDoc, editor]);

    // Update editor context
    useEffect(() => {
        setEditor(editor);
        return () => setEditor(null);
    }, [editor, setEditor]);

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
        <div className="flex-1 bg-gray-100 overflow-y-auto h-full p-8 flex justify-center">
            <div className="w-full max-w-[816px]"> {/* A4 width approx */}
                <EditorContent editor={editor} />

                {/* Debug info - remove in production */}
                {/* <div className="mt-4 text-xs text-gray-500">
                    Words: {editor.storage.characterCount?.words?.() || 0} |
                    Chars: {editor.storage.characterCount?.characters?.() || 0}
                </div> */}
            </div>
        </div>
    );
};

export default RichTextEditor;