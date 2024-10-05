"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import ScrollIndicator from "@/app/(main)/_components/scroll";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SubscribeWidget from "@/app/(marketing)/_components/subscribe";
import ShareButtons from "@/app/(marketing)/_components/sharebuttons";
import Link from "next/link";

const AUTHOR_NAME = 'Citrus Team';
const AUTHOR_IMAGE = '/logo.svg'; // Replace with the actual author image path

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
    const [readingTime, setReadingTime] = useState<number>(0);

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

    useEffect(() => {
        if (document?.content) {
            const extractedHeadings = extractHeadings(document.content);
            setHeadings(extractedHeadings);
            setReadingTime(calculateReadingTime(document.content));
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
        <>
            <ShareButtons />
            <ScrollIndicator />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="pb-40 pt-10 w-full max-w-full xs:max-w-3xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto bg-white">
                    <div className="flex flex-col lg:flex-row lg:space-x-8">
                        <article className="flex-grow px-2 sm:px-2 lg:px-6">
                            <div className="mb-6">
                                <Link href="/blog" passHref>
                                    <Button variant="ghost" className="pl-0 text-primary hover:text-primary/80">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Blog
                                    </Button>
                                </Link>
                            </div>
                            <Cover preview url={document.coverImage} />
                            <div className="mt-6 mb-8 flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={AUTHOR_IMAGE} alt={AUTHOR_NAME} />
                                    <AvatarFallback>{AUTHOR_NAME[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-xl font-semibold">{AUTHOR_NAME}</h2>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDate(document._creationTime)}</span>
                                        <span>•</span>
                                        <BookOpen className="h-4 w-4" />
                                        <span>{readingTime} min read</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mx-auto">
                                <Toolbar preview initialData={document} />
                                <Editor
                                    editable={false} 
                                    onChange={(content) => {
                                        onChange(content);
                                        const extractedHeadings = extractHeadings(content);
                                        setHeadings(extractedHeadings);
                                        setReadingTime(calculateReadingTime(content));
                                    }}
                                    initialContent={document.content}
                                />
                            </div>
                            <div>
                                <SubscribeWidget />
                            </div>
                        </article>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default DocumentIdPage;