import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";

export const saveDocumentAsDoc = (title: string, content: string) => {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        text: content.replace(/<[^>]*>?/gm, ""), // Strip HTML tags
                    }),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `${title}.docx`);
    });
};