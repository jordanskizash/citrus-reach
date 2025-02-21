import { Metadata } from 'next'
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import DocumentIdPage from './documentIdPage';
import { notFound } from 'next/navigation';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import { Script } from 'vm';

interface PageProps {
    params: {
        slug: string;
    };
}

// Add this helper function right after the interfaces
function extractTextFromBlockNoteContent(content: string): string {
    try {
        const blocks = JSON.parse(content);
        let text = '';
        
        // Recursive function to extract text from blocks
        const extractText = (block: any) => {
            // Handle text content in the block itself
            if (block.content) {
                block.content.forEach((item: any) => {
                    if (item.type === 'text') {
                        text += item.text + ' ';
                    }
                });
            }
            
            // Handle nested blocks
            if (block.children) {
                block.children.forEach(extractText);
            }
        };

        // Process each top-level block
        blocks.forEach(extractText);
        
        // Clean up the text
        return text.trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' '); // Replace newlines with spaces
    } catch (error) {
        console.error('Error parsing BlockNote content:', error);
        return '';
    }
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getDocumentBySlug(slug: string) {
    try {
        return await convex.query(api.documents.getBySlug, { slug });
    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const document = await getDocumentBySlug(params.slug);

    if (!document) {
        return {
            title: 'Document Not Found',
        };
    }

    // Extract plain text from the BlockNote content
    const description = document.content 
        ? extractTextFromBlockNoteContent(document.content).substring(0, 160) // Limit to 160 characters for SEO
        : "No content available";

    const metadata: Metadata = {
        title: document.title || 'Document Page',
        description,
        openGraph: {
            title: document.title || 'Document',
            description,
            images: document.coverImage ? [{ url: document.coverImage }] : [],
            type: 'article',
            authors: [document.authorFullName || ''],
            publishedTime: new Date(document._creationTime).toISOString(),
        },
        twitter: {
            card: 'summary_large_image',
            title: document.title || 'Document',
            description,
            images: document.coverImage ? [document.coverImage] : [],
        },
        // Add article schema
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${params.slug}`,
        },
    };

    return metadata;
}

export default async function Page({ params }: PageProps) {
    const document = await getDocumentBySlug(params.slug);

    if (!document) {
        notFound();
    }

    return <DocumentIdPage document={document} />;
}