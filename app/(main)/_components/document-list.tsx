"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { CirclePlusIcon, FileIcon, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentListProps {
    parentDocumentId?: Id<"documents">;
    level?: number,
    data?: Doc<"documents">[];
}

export const DocumentList = ({
    parentDocumentId,
    level = 0
}: DocumentListProps) => {
    const params = useParams();
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const createDocument = useMutation(api.documents.create);

    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }));
    };

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId
    });

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    const onCreateBlog = async () => {
        const promise = createDocument({ title: "Untitled" })
        toast.promise(promise, {
            loading: "Creating a new blog...",
            success: "New blog created!",
            error: "Failed to create new blog."
        }).then((documentId) => {
            router.push(`/documents/${documentId}`);
        });

    }

    if (documents === undefined) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        );
    };

    return (
        <>
            <p
                style={{
                    paddingLeft: level ? `${(level * 12) + 25}px` : undefined
                }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    expanded && "last:block",
                    level === 0 && "hidden"
                )}
            >
                No pages inside
            </p>
            <div className="flex items-center justify-between ml-4 mb-2">
                <h1 className="text-sm text-muted-foreground">Blogs</h1>
                <div 
                    onClick={() => {}} 
                    className="cursor-pointer group-hover:opacity-100 h-full ml-auto rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-2"
                >
                    <CirclePlusIcon className="h-5 w-5 text-muted-foreground" onClick={onCreateBlog} />  
                </div>
            </div>
            {documents.map((document) => (
                <div key={document._id} style={{ paddingLeft: `${level * 15}px` }}>
                    <Item 
                        id={document._id}
                        onClick={() => onRedirect(document._id)}
                        label={document.title}
                        icon={FileIcon} 
                        documentIcon={document.icon}
                        active={params.documentId === document._id}
                        onExpand={() => onExpand(document._id)}
                        expanded={expanded[document._id]}
                    />
                    {expanded[document._id] && (
                        <DocumentList 
                            parentDocumentId={document._id}
                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </>
    )
}