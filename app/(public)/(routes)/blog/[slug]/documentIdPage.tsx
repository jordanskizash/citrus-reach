"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, useCallback } from "react";
import ScrollIndicator from "@/app/(main)/_components/scroll";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SubscribeWidget from "@/app/(marketing)/_components/subscribe";
import ShareButtons from "@/app/(marketing)/_components/sharebuttons";
import Link from "next/link";
import { LogoOnly } from "@/app/(marketing)/_components/logojust";
import _ from "lodash";

const AUTHOR_NAME = 'Citrus Team';
const AUTHOR_IMAGE = '/logo.svg';

interface DocumentIdPageProps {
    document: Doc<"documents">; 
}

interface Heading {
    id: string;
    text: string;
    level: number;
}

function LikeButton({ documentId }: { documentId: Id<"documents"> }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const likeStatus = useQuery(api.documents.getLikeCount, { 
        documentId 
    });

    const toggleLike = useMutation(api.documents.togglePublicLike);

    useEffect(() => {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        setIsLiked(!!likedPosts[documentId]);
    }, [documentId]);

    useEffect(() => {
        if (likeStatus !== undefined) {
            setLikeCount(likeStatus);
        }
    }, [likeStatus]);

    const handleLikeClick = async () => {
        try {
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
            const newLikeStatus = !likedPosts[documentId];
            
            likedPosts[documentId] = newLikeStatus;
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

            setIsLiked(newLikeStatus);
            setLikeCount(prev => newLikeStatus ? prev + 1 : Math.max(0, prev - 1));

            await toggleLike({ 
                documentId,
                action: newLikeStatus ? 'increment' : 'decrement'
            });
        } catch (error) {
            console.error("Error toggling like:", error);
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
            delete likedPosts[documentId];
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            setIsLiked(false);
        }
    };

    return (
        <button 
            onClick={handleLikeClick}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            title={isLiked ? "Remove like" : "Like this article"}
        >
            <Heart 
                className={`w-5 h-5 transition-all duration-200 ease-in-out
                    ${isLiked ? 'fill-current text-black' : 'text-gray-500'}
                    hover:scale-110`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
        </button>
    );
}

const DocumentIdPage = ({ document }: DocumentIdPageProps) => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [readingTime, setReadingTime] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const latestDocument = useQuery(api.documents.getBySlug, {
        slug: document.slug ?? ''
    });

    const currentDocument = latestDocument ?? document;
    const update = useMutation(api.documents.update);

     // Optimize the onChange handler with useCallback
     const onChange = useCallback((content: string) => {
        update({
            id: currentDocument._id,
            content
        });
    }, [currentDocument._id, update]);

    // Extract headings from HTML content
    const extractHeadingsFromHtml = (html: string): Heading[] => {
        if (typeof window !== 'undefined') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            
            return headings.map((heading, index) => ({
                id: `heading-${index}`,
                text: heading.textContent || '',
                level: parseInt(heading.tagName[1])
            }));
        }
        return [];
    };

    // Calculate reading time from HTML content
    const calculateReadingTime = (html: string): number => {
        if (typeof window !== 'undefined') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const text = doc.body.textContent || '';
            const wordsPerMinute = 200;
            const wordCount = text.trim().split(/\s+/).length;
            return Math.ceil(wordCount / wordsPerMinute);
        }
        return 0;
    };

    const formatDate = (date: number) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const trackPageView = async () => {
            try {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        startDate: 'today',
                        endDate: 'today',
                        pageId: `/blog/${document._id}`,
                        pageTitle: document.title,
                    }),
                });
            } catch (error) {
                console.error('Error tracking page view:', error);
            }
        };

        trackPageView();
    }, [document._id, document.title]);

    // Update headings and reading time when content changes
    // Optimize content change handler with debouncing and useCallback
    const handleContentChange = useCallback(
        _.debounce((htmlContent: string) => {
            // Prevent concurrent updates
            if (isUpdating) return;
            
            setIsUpdating(true);
            
            try {
                const extractedHeadings = extractHeadingsFromHtml(htmlContent);
                const calculatedReadingTime = calculateReadingTime(htmlContent);
                
                setHeadings(extractedHeadings);
                setReadingTime(calculatedReadingTime);

                // Only update if content has changed
                if (currentDocument.htmlContent !== htmlContent) {
                    update({
                        id: currentDocument._id,
                        content: document.content,
                        htmlContent
                    });
                }
            } catch (error) {
                console.error('Error handling content change:', error);
            } finally {
                setIsUpdating(false);
            }
        }, 1000), // 1 second delay
        [currentDocument._id, document.content, update, isUpdating]
    );

    // Cleanup debounced function
    useEffect(() => {
        return () => {
            handleContentChange.cancel();
        };
    }, [handleContentChange]);

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
                <div className="pb-40 pt-10 w-full px-4 sm:px-6 mx-auto bg-white">
                    <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
                        <article className="w-full">
                            <div className="mb-6">
                                <Link href="/blog" passHref>
                                    <Button variant="ghost" className="pl-0 text-primary hover:text-primary/80">
                                        <ArrowLeft className="mr-2 ml-2 h-4 w-4" />
                                        Back to Blog
                                    </Button>
                                </Link>
                            </div>
                            <div className="mx-[8px] sm:mx-0">
                                <Cover preview url={document.coverImage} />
                            </div>

                            <div className="px-4 w-full sm:px-6 editor-container"> 
                                <div className="mt-6 mb-6 flex justify-between items-center">
                                    <div className="flex items-center space-x-2 sm:space-x-4">
                                        <Avatar className="h-8 w-8 sm:h-12 sm:w-12">
                                            <AvatarImage src={document.authorImageUrl} alt={document.authorFullName || "Author"}/>
                                            <AvatarFallback>{document.authorFullName?.[0] || "A"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="text-sm sm:text-xl font-semibold">{document.authorFullName}</h2>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-500">
                                                <Clock className="hidden sm:inline h-3 w-3 sm:h-4 sm:w-4" />
                                                <span>{formatDate(document._creationTime)}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <BookOpen className="hidden sm:inline h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">{readingTime} min read</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <LikeButton documentId={document._id} />
                                    </div>
                                </div>
                                {/* <div className="max-w-5xl mx-auto">  */}
                                <Toolbar preview initialData={document} />
                                <div className="w-full pl-[45px] mt-4 overflow-x-hidden">
                                
                                    <Editor
                                        editable={false}
                                        onChange={onChange}
                                        initialContent={document.content}
                                        isPublished={true} // Force published mode for public viewing
                                        onHTMLGenerated={(html) => {
                                            handleContentChange(html);
                                            // Optionally store the HTML version in your database
                                            update({
                                                id: currentDocument._id,
                                                content: document.content,
                                                htmlContent: html
                                            });
                                        }}
                                    />
                                </div>
                                {/* </div> */}
                            </div>
                            <div>
                                <SubscribeWidget />
                                <h2 className="flex items-center justify-center text-md">
                                    Made with 
                                    <span className="ml-2 w-6 h-6 sm:w-8 sm:h-8">
                                        <LogoOnly />
                                    </span>
                                </h2>
                            </div>
                        </article>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default DocumentIdPage;