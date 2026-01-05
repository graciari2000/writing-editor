import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export const saveDocumentAsDoc = (title: string, content: string) => {
    try {
        // Convert HTML to plain text with basic paragraph preservation
        const plainText = content.replace(/<[^>]*>?/gm, "");
        const paragraphs = plainText.split(/\n+/).filter(p => p.trim());
        
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // Title
                        new Paragraph({
                            text: title,
                            heading: HeadingLevel.TITLE,
                            spacing: {
                                after: 200,
                            },
                        }),
                        // Content paragraphs
                        ...paragraphs.map(text => 
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: text.trim(),
                                        size: 24, // 12pt
                                    }),
                                ],
                                spacing: {
                                    after: 100,
                                },
                            })
                        ),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
        }).catch(error => {
            console.error("Error generating DOCX:", error);
            alert("Failed to save document. Please try again.");
        });
    } catch (error) {
        console.error("Error in saveDocumentAsDoc:", error);
        alert("Failed to save document. Please try again.");
    }
};