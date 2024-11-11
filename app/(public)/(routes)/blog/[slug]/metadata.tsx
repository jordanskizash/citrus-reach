// Add this line to your page or layout file
export const dynamic = "force-dynamic";

import { Metadata } from 'next';
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";


interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
}

export async function generateMetadata({ params }: DocumentIdPageProps): Promise<Metadata> {
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
