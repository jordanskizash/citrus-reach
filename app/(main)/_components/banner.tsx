"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface BannerProps {
    documentId?: Id<"documents">;
    profileId?: Id<"profiles">;
};

export const Banner = ({
    documentId,
    profileId
}: BannerProps) => {
    const router = useRouter();

    const removeDocument = useMutation(api.documents.remove);
    const removeProfile = useMutation(api.profiles.remove);
    const restoreDocument = useMutation(api.documents.restore);
    const restoreProfile = useMutation(api.profiles.restore);

    const onRemove = () => {
        if (documentId) {
            const promise = removeDocument({ id: documentId });
            toast.promise(promise, {
                loading: "Deleting document...",
                success: "Document deleted!",
                error: "Failed to delete document."
            });
            router.push("/documents");
        } else if (profileId) {
            const promise = removeProfile({ id: profileId });
            toast.promise(promise, {
                loading: "Deleting profile...",
                success: "Profile deleted!",
                error: "Failed to delete profile."
            });
            router.push("/profiles");
        }
    };

    const onRestore = () => {
        if (documentId) {
            const promise = restoreDocument({ id: documentId });
            toast.promise(promise, {
                loading: "Restoring document...",
                success: "Document restored!",
                error: "Failed to restore document."
            });
        } else if (profileId) {
            const promise = restoreProfile({ id: profileId });
            toast.promise(promise, {
                loading: "Restoring profile...",
                success: "Profile restored!",
                error: "Failed to restore profile."
            });
        }
    };

    return (
        <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
            <p>
                This page is in the trash
            </p>
            <Button
                size="sm"
                onClick={onRestore}
                variant="outline"
                className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
            >
                Restore page
            </Button>
            <ConfirmModal onConfirm={onRemove}>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
                >
                    Delete forever
                </Button>
            </ConfirmModal>
        </div>
    );
};