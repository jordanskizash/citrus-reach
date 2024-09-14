import { generateMetadata } from './metadata'
import DocumentIdPage from './documentIdPage'
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
    params: {
        documentId: Id<"documents">;
    };
}

export { generateMetadata }

export default function Page({ params }: PageProps) {
    return <DocumentIdPage params={params} />
}