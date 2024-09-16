import { Metadata } from 'next'
import DocumentIdPage from './documentIdPage'
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

interface PageProps {
    params: {
        documentId: Id<"documents">;
    };
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const document = await convex.query(api.documents.getById, { documentId: params.documentId });

    if (!document) {
        return {
            title: 'Document Not Found',
        };
    }

    const metadata: Metadata = {
        title: document.title || 'Document Page',
        openGraph: {
            title: document.title || 'Document',
            description: "Description of the document",
        },
        twitter: {
            card: 'summary_large_image',
        },
    };

    if (document.coverImage) {
        metadata.openGraph!.images = [{ url: document.coverImage }];
        metadata.twitter!.images = [document.coverImage];
    }

    return metadata;
}

export default function Page({ params }: PageProps) {
    return <DocumentIdPage params={params} />
}