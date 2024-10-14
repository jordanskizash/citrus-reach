"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  documentId?: Id<"documents">;
}

export const Navbar = ({
  isCollapsed,
  onResetWidth,
}: NavbarProps) => {
  const params = useParams();

  const document = useQuery(api.documents.getById, {
    documentId: params.documentId as Id<"documents">,
  });

  if (document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  // Extract the cover image URL from the document
  const coverImageUrl = document.coverImage;

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 lg:max-w-screen-2xl md:max-w-screen-xl sm:max-w-screen-md flex items-center justify-between flex-wrap">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full flex-wrap">
          <Title initialData={document} />
          <div className="items-center gap-x-2 flex-shrink-0">
            <Publish initialData={document} />
            <Menu
              documentId={document._id}
              coverImageUrl={coverImageUrl}
            />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document._id} />}
    </>
  );
};
