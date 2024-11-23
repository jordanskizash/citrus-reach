"use client";

import {
    BlockNoteEditor,
    PartialBlock
} from "@blocknote/core";

import {
    useCreateBlockNote
} from "@blocknote/react";

import {
    BlockNoteView
} from "@blocknote/mantine";
import { useEdgeStore } from "@/lib/edgestore";

import { useTheme } from "next-themes";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";




interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
};

const Editor = ({
    onChange,
    editable,
    initialContent
}: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { edgestore } = useEdgeStore();

    const handleUpload = async (file: File) => {
        const response = await edgestore.publicFiles.upload({
            file,
        });

        return response.url;
    }

    const editor: BlockNoteEditor = useCreateBlockNote ({
        initialContent: initialContent ? JSON.parse(initialContent) as PartialBlock[]: undefined,
        uploadFile: handleUpload
    });

    const handleEditorChange = () => {
        onChange(JSON.stringify(editor.document, null, 2));
    };

    return (
        <div className="w-full editor-container" style={{ maxWidth: '100%' }}>
            <BlockNoteView 
                editable={editable}
                editor={editor}
                theme={resolvedTheme ==="dark" ? "dark" : "light" }
                onChange={() => {
                    onChange(JSON.stringify(editor.document, null, 2));
                }}
            />
        </div>
    )
}

export default Editor;