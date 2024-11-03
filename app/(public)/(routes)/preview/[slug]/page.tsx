import { Metadata } from 'next'
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import DocumentIdPage from './documentIdPage';
import { notFound } from 'next/navigation';


interface PageProps {
    params: {
        slug: string;
    };
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

    const metadata: Metadata = {
        title: document.title || 'Document Page',
        description: document.content ? document.content.substring(0, 200) : "No content available",
        openGraph: {
            title: document.title || 'Document',
            description: document.content ? document.content.substring(0, 200) : "No content available",
            images: document.coverImage ? [{ url: document.coverImage }]:[],
        },
        twitter: {
            card: 'summary_large_image',
            title: document.title || 'Document',
            description: document.content ? document.content.substring(0, 200) : "No content available",
            images: document.coverImage ? [document.coverImage] : [],
        },
    };

    if (document.coverImage) {
        metadata.openGraph!.images = [{ url: document.coverImage }];
        metadata.twitter!.images = [document.coverImage];
    }

    return metadata;
}

export default async function Page({ params }: PageProps) {
    const document = await getDocumentBySlug(params.slug);

    if (!document) {
        notFound();
    }

    return <DocumentIdPage document={document} />;
}