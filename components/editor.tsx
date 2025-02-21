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
import _ from 'lodash';
import { ContentSkeleton } from "@/components/content-skeleton";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
    isPublished?: boolean;
    onHTMLGenerated?: (htmlContent: string) => void;
    onLoadingChange?: (isLoading: boolean) => void;
};

// Add this helper function before the Editor component
const cleanUpHtml = (html: string): string => {
    return html
        // Replace BlockNote specific classes with semantic HTML
        .replace(/class="bn-inline-content"/g, '')
        // Add proper semantic structure
        .replace(/<p><\/p>/g, '') // Remove empty paragraphs
        .replace(/<h([1-6]).*?>/g, '<h$1>') // Clean up heading tags
        // Ensure proper spacing between elements
        .replace(/>\s+</g, '><')
        // Wrap images in figure tags for better semantics
        .replace(/<img(.*?)>/g, '<figure><img$1></figure>')
        // Clean up any double spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
};

const Editor = ({
    onChange,
    editable,
    initialContent,
    isPublished = false,
    onHTMLGenerated,
    onLoadingChange
}: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { edgestore } = useEdgeStore();
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [isConverting, setIsConverting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    // Update the debounced HTML conversion
    const debouncedConvertToHtml = useCallback(
        _.debounce(async (content: string) => {
            if (isConverting) return;
            setIsConverting(true);
            try {
                const blocks = JSON.parse(content);
                let html = await editor.blocksToHTMLLossy(blocks);
                
                // Add semantic structure and clean up the HTML
                html = cleanUpHtml(`<article>${html}</article>`);
                
                setHtmlContent(html);
                onHTMLGenerated?.(html);
            } catch (error) {
                console.error("Error converting to HTML:", error);
            } finally {
                setIsConverting(false);
                setIsLoading(false);
            }
        }, 1000),
        [editor, onHTMLGenerated]
    );

    useEffect(() => {
        onLoadingChange?.(isLoading);
    }, [isLoading, onLoadingChange]);

    useEffect(() => {
        if (!editable && isPublished && initialContent && !htmlContent) {
            setIsLoading(true);
            debouncedConvertToHtml(initialContent);
        }
    }, [editable, isPublished, initialContent, htmlContent, debouncedConvertToHtml]);

    useEffect(() => {
        return () => {
            debouncedConvertToHtml.cancel();
        };
    }, [debouncedConvertToHtml]);

    const handleEditorChange = async () => {
        const jsonContent = JSON.stringify(editor.document, null, 2);
        onChange(jsonContent);

        if (!editable && isPublished) {
            setIsLoading(true);
            debouncedConvertToHtml(jsonContent);
        }
    };

    if (!editable && isPublished) {
        if (isLoading) {
            return <ContentSkeleton />;
        }

        return (
            <div className="w-full min-h-screen">
                <div 
                    className="prose prose-gray"
                    style={{
                        fontSize: '1rem',
                        lineHeight: '1.75',
                        color: '#4B5563',
                        maxWidth: 'none',
                    }}
                    dangerouslySetInnerHTML={{ 
                        __html: htmlContent
                    }} 
                />
            </div>
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