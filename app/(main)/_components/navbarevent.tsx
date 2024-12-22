"use client";

import { useState, useEffect } from 'react';
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from 'lucide-react';
import { useParams } from "next/navigation";
import { EventTitle } from './eventtitle';
import { PublishEvent } from './publish-event';
import { Banner } from "./banner";
import { Menu } from "./menu";
import { cn } from '@/lib/utils';

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  eventId?: Id<"events">;
}

export const NavbarEvents = ({
  isCollapsed,
  onResetWidth,
}: NavbarProps) => {
  const [isTransparent, setIsTransparent] = useState(false);
  const params = useParams();

  const event = useQuery(api.events.getEvent, {
    eventId: params.eventId as Id<"events">,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsTransparent(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (event === undefined) {
    return (
      <div className="w-full fixed top-0 z-50">
        <nav className={cn(
          "px-3 py-2 w-full flex items-center",
          "bg-background dark:bg-[#1F1F1F]",
          "transition-opacity duration-300 ease-in-out",
          isTransparent ? 'opacity-0' : 'opacity-100'
        )}>
          {isCollapsed && (
            <MenuIcon
              role="button"
              onClick={onResetWidth}
              className="h-6 w-6 text-muted-foreground mr-4 cursor-pointer"
            />
          )}
          <EventTitle.Skeleton />
          <div className="flex items-center gap-x-2">
            <Menu.Skeleton />
          </div>
        </nav>
      </div>
    );
  }

  if (event === null) {
    return null;
  }

  return (
    <div className="w-full fixed top-0 z-50">
      <nav className={cn(
        "px-3 py-2 w-full flex items-center",
        "bg-background dark:bg-[#1F1F1F]",
        "transition-opacity duration-300 ease-in-out",
        isTransparent ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}>
        <div className="flex items-center justify-between w-full gap-x-4">
          <div className="flex items-center gap-x-4 min-w-0 overflow-hidden">
            {isCollapsed && (
              <MenuIcon
                role="button"
                onClick={onResetWidth}
                className="h-6 w-6 text-muted-foreground flex-shrink-0 cursor-pointer"
              />
            )}
            <div className="truncate">
              <EventTitle initialData={event} />
            </div>
          </div>
          <div className="flex items-center gap-x-2 flex-shrink-0 mr-2">
            <PublishEvent initialData={event} />
            <Menu eventId={event._id} />
          </div>
        </div>
      </nav>
      {event.isArchived && <Banner eventId={event._id} />}
    </div>
  );
};

export default NavbarEvents;

