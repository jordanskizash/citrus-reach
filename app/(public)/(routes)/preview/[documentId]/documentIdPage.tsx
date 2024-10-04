"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { useUser } from "@clerk/clerk-react";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import ScrollIndicator from "@/app/(main)/_components/scroll";
import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscribeWidget from "@/app/(marketing)/_components/subscribe";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
    initialDocument: Doc<"documents">;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

const DocumentIdPage = ({ params, initialDocument }: DocumentIdPageProps) => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);
    const [headings, setHeadings] = useState<Heading[]>([]);

    const document = useQuery(api.documents.getById, {
        documentId: params.documentId
    });

    const update = useMutation(api.documents.update);

    const onChange = (content: string) => {
        update({
            id: params.documentId,
            content
        });
    };

    const formatDate = (date: number) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const {user}= useUser();

    const extractHeadings = (content: string) => {
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

    useEffect(() => {
        if (document?.content) {
            const extractedHeadings = extractHeadings(document.content);
            setHeadings(extractedHeadings);
        }
    }, [document?.content]);

    if (document === undefined) {
        return (
            <div>
                <Cover.Skeleton />
                <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-[50%]"/>
                        <Skeleton className="h-14 w-[80%]"/>
                        <Skeleton className="h-14 w-[40%]"/>
                        <Skeleton className="h-14 w-[60%]"/>
                    </div>
                </div>
            </div>
        );
    }

    if (document === null) {
        return <div>Not Found</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            
            <ScrollIndicator />
            <div className="pb-40 pt-10 max-w-7xl mx-auto px-4 sm:px-2 lg:px-8 bg-white">
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                    <article className="flex-grow">
                        <div className="mb-4 text-sm text-gray-500">
                            <div>{user?.fullName}</div>

                            {formatDate(document._creationTime)}
                        </div>
                        <Cover preview url={document.coverImage} />
                        <div className="mx-auto">
                            <Toolbar preview initialData={document} />
                            <Editor
                                editable={false} 
                                onChange={(content) => {
                                    onChange(content);
                                    const extractedHeadings = extractHeadings(content);
                                    setHeadings(extractedHeadings);
                                }}
                                initialContent={document.content}
                            />
                        </div>
                        <div>
                            <SubscribeWidget />
                        </div>
                        <div className="mt-8 flex justify-center space-x-4">
                            <Button variant="outline" size="sm" className="hover:bg-orange-300">
                                <Mail className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-orange-300">
                                <Linkedin className="w-4 h-4 mr-2" />
                                Post
                            </Button>
                            
                        </div>
                    </article>
                </div>
            </div>
        </motion.div>
    );
}

export default DocumentIdPage;