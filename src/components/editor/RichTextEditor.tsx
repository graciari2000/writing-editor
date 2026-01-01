import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { useAppStore } from '../../store/useAppStore';
import { useEditorContext } from './EditorContext';

const RichTextEditor: React.FC = () => {
    const { currentDocumentId, documents, updateCurrentDocument } = useAppStore();
    const { setEditor } = useEditorContext();

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
            }),
            Image,
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

    // Sync editor content when current document changes
    useEffect(() => {
        if (editor && currentDoc && editor.getHTML() !== currentDoc.content) {
            // Only update if content is different to avoid cursor jumping
            // This is a naive check, for production might need better diffing
            // But for switching docs it's fine.
            // However, onUpdate triggers updateCurrentDocument which triggers this useEffect.
            // We need to be careful.
            // Actually, if we switch documents, we want to set content.
            // If we are typing, we don't want to re-set content.

            // A simple way is to check if the document ID changed.
        }
    }, [currentDoc?.id, editor]);

    // Better approach for document switching:
    useEffect(() => {
        if (editor && currentDoc) {
            // Check if the content in store is significantly different (e.g. loaded a new doc)
            // or just use a key on the component to force re-mount when docId changes.
            // But re-mounting loses history.

            // Let's just set content if it's a different document ID
            // We can track the last loaded doc ID in a ref?
        }
    }, [currentDoc?.id]);

    // Actually, the easiest way to handle doc switching is to use the `content` prop in useEditor
    // but useEditor doesn't update content dynamically after init unless we use useEffect.

    useEffect(() => {
        if (editor && currentDoc) {
            // We only want to set content if we switched documents.
            // If we are just typing, the store updates, but we shouldn't re-set the editor content
            // because that resets the cursor.

            // We can compare the editor content with the store content.
            // But HTML strings might differ slightly.

            // Let's assume for now we just set content when doc ID changes.
            // We can achieve this by passing `currentDocumentId` as a key to the component wrapper?
            // No, that would destroy the editor instance.

            // Let's try:
            const currentContent = editor.getHTML();
            if (currentDoc.content !== currentContent) {
                // This might still cause issues if the store update is slightly delayed or formatted differently.
                // A common pattern is to only set content if the editor is empty or we explicitly switched docs.
            }
        }
    }, [currentDoc, editor]);

    // Let's use a ref to track the current doc ID
    const docIdRef = React.useRef(currentDocumentId);

    useEffect(() => {
        if (editor && currentDoc && docIdRef.current !== currentDocumentId) {
            editor.commands.setContent(currentDoc.content);
            docIdRef.current = currentDocumentId;
        }
    }, [currentDocumentId, currentDoc, editor]);

    useEffect(() => {
        setEditor(editor);
        return () => setEditor(null);
    }, [editor, setEditor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex-1 bg-gray-100 overflow-y-auto h-full p-8 flex justify-center">
            <div className="w-full max-w-[816px]"> {/* A4 width approx */}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;