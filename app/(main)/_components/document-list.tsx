"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
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

// document-list.tsx
export const DocumentList = ({
    parentDocumentId,
    level = 0
}: DocumentListProps) => {
    const params = useParams();
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: parentDocumentId
    });

    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }));
    };

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

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

    // Get height of first document to set container height
    const singleItemHeight = 27; // min-height from Item component
    const maxVisibleItems = 5;
    const containerHeight = singleItemHeight * maxVisibleItems;

    return (
        <>
            <div className="flex flex-col">
                {documents.length > 5 && (
                    <div className="px-3 py-1 text-xs text-muted-foreground">
                        Scroll for all {documents.length} items
                    </div>
                )}
                <div 
                    className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    style={{ maxHeight: `${containerHeight}px` }}
                >
                    {documents.map((document) => (
                        <div key={document._id}>
                            <Item
                                id={document._id}
                                onClick={() => onRedirect(document._id)}
                                label={document.title}
                                icon={FileIcon}
                                documentIcon={document.icon}
                                active={params.documentId === document._id}
                                level={level}
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
                </div>
            </div>
        </>
    );
};