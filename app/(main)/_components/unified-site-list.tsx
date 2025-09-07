"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Item } from "./item";
import { ProfItem } from "./prof-item";
import { cn } from "@/lib/utils";
import { FileIcon, UserIcon, Calendar } from "lucide-react";
import toast from "react-hot-toast";

type UnifiedSiteData = {
  id: string;
  title: string;
  type: 'document' | 'profile' | 'event';
  creationTime: number;
  data: Doc<"documents"> | Doc<"profiles"> | Doc<"events">;
};

interface UnifiedSiteListProps {
  level?: number;
}

export const UnifiedSiteList = ({
  level = 0
}: UnifiedSiteListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: undefined
  });
  
  const profiles = useQuery(api.profiles.getSidebar, {
    parentProfile: undefined
  });
  
  const events = useQuery(api.events.getSidebar, {
    // Assuming events has the same pattern as documents and profiles
  });

  const onExpand = (siteId: string) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [siteId]: !prevExpanded[siteId]
    }));
  };

  const onRedirect = (site: UnifiedSiteData) => {
    switch (site.type) {
      case 'document':
        router.push(`/documents/${site.id}`);
        break;
      case 'profile':
        router.push(`/profiles/${site.id}`);
        break;
      case 'event':
        router.push(`/events/${site.id}`);
        break;
    }
  };

  // Loading state
  if (documents === undefined || profiles === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  // Combine and sort all sites
  const allSites: UnifiedSiteData[] = [
    ...(documents || []).map(doc => ({
      id: doc._id,
      title: doc.title,
      type: 'document' as const,
      creationTime: doc._creationTime,
      data: doc
    })),
    ...(profiles || []).map(profile => ({
      id: profile._id,
      title: profile.displayName,
      type: 'profile' as const,
      creationTime: profile._creationTime || 0,
      data: profile
    })),
    ...(events || []).map(event => ({
      id: event._id,
      title: event.title,
      type: 'event' as const,
      creationTime: event._creationTime,
      data: event
    }))
  ].sort((a, b) => b.creationTime - a.creationTime);

  if (allSites.length === 0) {
    return (
      <div
        style={{
          paddingLeft: level ? `${(level * 12) + 25}px` : "12px"
        }}
        className="hidden text-sm font-medium text-muted-foreground/80"
      >
        No sites found.
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      {allSites.map(site => {
        if (site.type === 'document') {
          const doc = site.data as Doc<"documents">;
          return (
            <Item
              key={site.id}
              id={doc._id}
              onClick={() => onRedirect(site)}
              label={site.title}
              icon={FileIcon}
              documentIcon={doc.icon}
              active={params.documentId === site.id}
              level={level}
            />
          );
        } else if (site.type === 'profile') {
          const profile = site.data as Doc<"profiles">;
          return (
            <ProfItem
              key={site.id}
              id={profile._id}
              onClick={() => onRedirect(site)}
              label={site.title}
              icon={UserIcon}
              profileIcon={profile.icon}
              active={params.profileId === site.id}
              level={level}
            />
          );
        } else if (site.type === 'event') {
          const event = site.data as Doc<"events">;
          // For events, we'll use the Item component with Calendar icon
          return (
            <Item
              key={site.id}
              id={event._id as any} // Type conversion needed since Item expects document ID
              onClick={() => onRedirect(site)}
              label={site.title}
              icon={Calendar}
              active={params.eventId === site.id}
              level={level}
            />
          );
        }
        return null;
      })}
    </div>
  );
};