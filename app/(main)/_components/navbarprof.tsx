"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { ProfTitle } from "./prof-title";
import { PublishProfile } from "./publishprof";
import { Banner } from "./banner";
import { Menu } from "./menu";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  profileId?: Id<"profiles">;
}

export const NavbarProfile = ({
  isCollapsed,
  onResetWidth,
}: NavbarProps) => {
  const params = useParams();

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId as Id<"profiles">,
  });

  if (profile === undefined) {
    return (
      <div className="w-screen max-w-[60vw]">
        <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center">
          <ProfTitle.Skeleton />
          <div className="flex items-center gap-x-2">
            <Menu.Skeleton />
          </div>
        </nav>
      </div>
    );
  }

  if (profile === null) {
    return null;
  }

  return (
    <div className="w-screen max-w-[10vw]">
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 max-w-full flex items-center overflow-x-hidden">
        <div className="flex items-center justify-between w-full gap-x-4">
          <div className="flex items-center gap-x-4 min-w-0 overflow-hidden">
            {isCollapsed && (
              <MenuIcon
                role="button"
                onClick={onResetWidth}
                className="h-6 w-6 text-muted-foreground flex-shrink-0"
              />
            )}
            <div className="truncate">
              <ProfTitle initialData={profile} />
            </div>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0 pr-6 overflow-x-hidden">
            {/* <PublishProfile initialData={profile} />
            <Menu profileId={profile._id} /> */}
          </div>
        </div>
      </nav>
      {profile.isArchived && <Banner profileId={profile._id} />}
    </div>
  );
};