"use client";

import {
    BlockNoteEditor,
    PartialBlock,
} from "@blocknote/core";
import {
    useCreateBlockNote
} from "@blocknote/react";
import {
    BlockNoteView
} from "@blocknote/mantine";
import { useEdgeStore } from "@/lib/edgestore";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import _ from 'lodash';  // Import full lodash
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
    isPublished?: boolean;
    onHTMLGenerated?: (htmlContent: string) => void;
};

const Editor = ({
    onChange,
    editable,
    initialContent,
    isPublished = false,
    onHTMLGenerated
}: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { edgestore } = useEdgeStore();
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [isConverting, setIsConverting] = useState(false);

    const handleUpload = async (file: File) => {
        const response = await edgestore.publicFiles.upload({
            file,
        });
        return response.url;
    }

    const editor = useCreateBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) as PartialBlock[] : undefined,
        uploadFile: handleUpload,
    });

    // Debounced HTML conversion using properly typed lodash
    const debouncedConvertToHtml = useCallback(
        _.debounce(async (content: string) => {
            if (isConverting) return;
            setIsConverting(true);
            try {
                const blocks = JSON.parse(content);
                const html = await editor.blocksToHTMLLossy(blocks);
                setHtmlContent(html);
                onHTMLGenerated?.(html);
            } catch (error) {
                console.error("Error converting to HTML:", error);
            } finally {
                setIsConverting(false);
            }
        }, 1000),
        [editor, onHTMLGenerated]
    );

    // Initial conversion
    useEffect(() => {
        if (!editable && isPublished && initialContent && !htmlContent) {
            debouncedConvertToHtml(initialContent);
        }
    }, [editable, isPublished, initialContent, htmlContent, debouncedConvertToHtml]);

    // Cleanup
    useEffect(() => {
        return () => {
            debouncedConvertToHtml.cancel();
        };
    }, [debouncedConvertToHtml]);

    const handleEditorChange = async () => {
        const jsonContent = JSON.stringify(editor.document, null, 2);
        onChange(jsonContent);

        if (!editable && isPublished) {
            debouncedConvertToHtml(jsonContent);
        }
    };

    if (!editable && isPublished && htmlContent) {
        return (
            <article className="max-w-5xl mx-auto">
                <div 
                    className="prose prose-gray mt-6"
                    style={{
                        fontSize: '1rem',
                        lineHeight: '1.75',
                        color: '#4B5563',
                    }}
                    dangerouslySetInnerHTML={{ 
                        __html: htmlContent || '<p>Loading content...</p>' 
                    }} 
                />
            </article>
        );
    }

    return (
        <div className="w-full editor-container">
            <BlockNoteView 
                editor={editor}
                editable={editable}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={handleEditorChange}
            />
        </div>
    );
}

export default Editor;