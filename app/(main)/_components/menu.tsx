"use client";

import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Share } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuProps {
  documentId?: Id<"documents">;
  profileId?: Id<"profiles">;
  eventId?: Id<"events">;
  coverImageUrl?: string;
}

export const Menu = ({
  documentId,
  profileId,
  eventId,
  coverImageUrl,
}: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();

  const archiveDocument = useMutation(api.documents.archive);
  const archiveProfile = useMutation(api.profiles.archive);
  const archiveEvent = useMutation(api.events.archive);

  const onArchive = () => {
    if (documentId) {
      const promise = archiveDocument({ id: documentId });
      toast.promise(promise, {
        loading: "Moving document to trash...",
        success: "Document moved to trash!",
        error: "Failed to archive document.",
      });
      router.push("/documents");
    } else if (profileId) {
      const promise = archiveProfile({ id: profileId });
      toast.promise(promise, {
        loading: "Moving profile to trash...",
        success: "Profile moved to trash!",
        error: "Failed to archive profile.",
      });
      router.push("/profiles");
    } else if (eventId) {
      const promise = archiveEvent({ id: eventId });
      toast.promise(promise, {
        loading: "Moving event to trash...",
        success: "Event moved to trash!",
        error: "Failed to archive event.",
      });
      router.push("/events");
    }
  };

  const onShare = () => {
    if (!coverImageUrl) {
      toast.error("No cover image to share.");
      return;
    }
    const subject = encodeURIComponent("Check out this image!");
    const body = encodeURIComponent(
      `Here's an image I'd like to share with you:\n\n${coverImageUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={onShare} disabled={!coverImageUrl}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};