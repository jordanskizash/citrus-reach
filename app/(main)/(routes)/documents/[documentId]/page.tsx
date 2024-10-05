"use client";

import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Status } from "@/app/(main)/_components/status";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
};

interface Heading {
    id: string;
    text: string;
    level: number;
  }

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const Editor = useMemo(() => dynamic (() => import("@/components/editor"), { ssr: false }), [])
    const [readingTime, setReadingTime] = useState<number>(0);

    const { user } = useUser();

    const document = useQuery(api.documents.getById, {
        documentId: params.documentId,
    });

    const update = useMutation(api.documents.update);

    const formatDate = (date: number) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const extractHeadings = (content: string): Heading[] => {
        try {
            const parsedContent = JSON.parse(content);
            const extractedHeadings: Heading[] = [];
            let headingId = 0;

            const traverse = (blocks: any[]) => {
                blocks.forEach((block) => {
                    if (block.type === 'heading' && block.content) {
                        extractedHeadings.push({
                            id: `heading-${headingId++}`,
                            text: block.content[0].text,
                            level: block.props.level
                        });
                    }
                    if (block.children) {
                        traverse(block.children);
                    }
                });
            };

            traverse(parsedContent);
            return extractedHeadings;
        } catch (error) {
            console.error("Error parsing content:", error);
            return [];
        }
    };

    const calculateReadingTime = (content: string): number => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    const onChange = (content: string) => {
        update({
            id: params.documentId,
            content
        });
    };

    if (document === undefined) {
        return(
            <div>
                <Cover.Skeleton />
                <div className="md:max-w-3xl lg-max-w-4xl mx-auto mt-10">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-[50%]"/>
                        <Skeleton className="h-14 w-[80%]"/>
                        <Skeleton className="h-14 w-[40%]"/>
                        <Skeleton className="h-14 w-[60%]"/>
                    </div>
                </div>
            </div>
        )
    }

    if (document === null) {
        return(
            <div>
                Not Found
            </div>
        )
    }

    return(
        <div className="pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[80vh]">
            <Status />
            <Cover url={document.coverImage} />
            <div className="mt-6 mb-6 ml-14 flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Author"} />
                    <AvatarFallback>{user?.fullName?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(document._creationTime)}</span>
                        {/* <span>•</span> */}
                        {/* <BookOpen className="h-4 w-4" /> */}
                        {/* <span>{readingTime} min read</span> */}
                    </div>
                </div>
            </div>
            <div className="mx-auto">
                <Toolbar initialData={document} />
                <Editor 
                    onChange={onChange}
                    initialContent={document.content}
                />
            </div>
        </div>
    );
}

export default DocumentIdPage;

