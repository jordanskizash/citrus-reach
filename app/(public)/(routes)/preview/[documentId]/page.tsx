import { Metadata } from 'next'
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import DocumentIdPage from './documentIdPage';


interface PageProps {
    params: {
        documentId: Id<"documents">;
    };
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getDocument(documentId: Id<"documents">) {
  return await convex.query(api.documents.getById, { documentId });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const document = await getDocument(params.documentId);

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
    const document = await getDocument(params.documentId);

    if (!document) {
        return <div>Document not found</div>;
    }

    return (
        <>
          <DocumentIdPage params={params} />
        </>
      );
}