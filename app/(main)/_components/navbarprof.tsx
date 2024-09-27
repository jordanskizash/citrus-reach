"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { ProfTitle } from "./prof-title";
import { Banner } from "./banner"; // Adjust or remove if not applicable
import { Menu } from "./menu"; // Adjust if necessary
// import { Publish } from "./publish"; // Omitted as per your request

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

  // Fetch the profile data using the profileId from the URL parameters
  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId as Id<"profiles">,
  });

  // Handle loading state
  if (profile === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <ProfTitle.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  // Handle the case where the profile doesn't exist
  if (profile === null) {
    return null;
  }

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
          <ProfTitle initialData={profile} />
          <div className="items-center gap-x-2 flex-shrink-0 ">
            {/* Omitted the Publish component */}
            
          </div>
        </div>
      </nav>
      {/* Adjust or remove the Banner component if necessary
      {profile.isArchived && <Banner profileId={profile._id} />} */}
    </>
  );
};
