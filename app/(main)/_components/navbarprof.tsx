"use client";

import { useState, useEffect } from 'react';
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
  const [isTransparent, setIsTransparent] = useState(false);
  const params = useParams();

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId as Id<"profiles">,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsTransparent(scrollPosition > 50);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (profile === undefined) {
    return (
      <div className="w-screen max-w-[10vw] fixed top-0 z-50">
        <nav className={`
          px-3 py-2 
          max-w-full 
          flex items-center 
          overflow-x-hidden 
          transition-opacity duration-300 ease-in-out
          ${isTransparent ? 'opacity-0' : 'opacity-100'}
          bg-background dark:bg-[#1F1F1F]
        `}>
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
    <div className="w-screen max-w-[10vw] fixed top-0 z-50">
      <nav 
        className={`
          px-3 py-2 
          max-w-full 
          flex items-center 
          overflow-x-hidden 
          transition-opacity duration-300 ease-in-out
          ${isTransparent ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          bg-background dark:bg-[#1F1F1F]
        `}
      >
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

export default NavbarProfile;