// src/utils/editorHelpers.ts

/**
 * Insert a page break into the editor with multiple fallback methods
 */
export const insertPageBreak = (editor: any) => {
    if (!editor) return;
    
    try {
        // Method 1: Use custom page break command if available
        if (editor.commands.insertPageBreak) {
            editor.commands.insertPageBreak();
            return;
        }
        
        // Method 2: Use horizontal rule as page break
        if (editor.commands.setHorizontalRule) {
            editor.chain().focus().setHorizontalRule().run();
            return;
        }
        
        // Method 3: Insert HTML page break directly
        const pageBreakHTML = '<div class="page-break" data-type="page-break"><hr class="page-break-line"><span class="page-break-text">Page Break</span></div>';
        editor.chain().focus().insertContent(pageBreakHTML).run();
        
    } catch (error) {
        console.error('Error inserting page break:', error);
        
        // Final fallback: simple horizontal rule
        editor.chain().focus().setHorizontalRule().run();
    }
};