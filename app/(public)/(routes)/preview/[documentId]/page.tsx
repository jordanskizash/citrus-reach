"use client";

import Head from "next/head";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useMemo } from "react";

interface DocumentIdPageProps {
    params: {
        documentId: Id<"documents">;
    };
};

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const Editor = useMemo(() => dynamic (() => import("@/components/editor"), { ssr: false }), [])

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
        <div className="pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-2 lg:px-8 h-[80vh]">
            <Head>
                <title>{document.title || 'Document Page'}</title>
                <meta property="og:title" content={document.title || 'Document'} />
                <meta property="og:description" content="Description of the document" />
                <meta property="og:image" content={document?.coverImage} />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <Cover preview url={document.coverImage} />
            <div className="mx-auto">
                <Toolbar preview initialData={document} />
                <Editor
                    editable={false} 
                    onChange={onChange}
                    initialContent={document.content}
                />
            </div>
        </div>
    );
}

export default DocumentIdPage;

