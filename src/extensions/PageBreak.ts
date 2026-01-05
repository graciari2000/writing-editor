// src/extensions/PageBreak.ts
import { Node } from '@tiptap/core';

export interface PageBreakOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageBreak: {
            /**
             * Insert a page break
             */
            insertPageBreak: () => ReturnType;
        };
    }
}

export const PageBreak = Node.create<PageBreakOptions>({
    name: 'pageBreak',
    
    group: 'block',
    
    atom: true,
    
    addOptions() {
        return {
            HTMLAttributes: {
                class: 'page-break',
            },
        };
    },
    
    addAttributes() {
        return {
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },
    
    parseHTML() {
        return [
            {
                tag: 'div[class="page-break"]',
            },
            {
                tag: 'hr.page-break',
            },
        ];
    },
    
    renderHTML({ HTMLAttributes }) {
        return ['div', { ...HTMLAttributes, 'data-type': 'page-break' }, 
            ['hr', { class: 'page-break-line' }],
            ['span', { class: 'page-break-text' }, 'Page Break']
        ];
    },
    
    addCommands() {
        return {
            insertPageBreak: () => ({ chain, state, dispatch }) => {
                if (dispatch) {
                    // Create the page break node
                    const { schema } = state;
                    const pageBreakNode = schema.nodes.pageBreak?.create();
                    
                    if (pageBreakNode) {
                        // Insert the page break
                        const tr = state.tr
                            .replaceSelectionWith(pageBreakNode)
                            .scrollIntoView();
                        
                        dispatch(tr);
                        return true;
                    }
                }
                return false;
            },
        };
    },
    
    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => this.editor.commands.insertPageBreak(),
        };
    },
});