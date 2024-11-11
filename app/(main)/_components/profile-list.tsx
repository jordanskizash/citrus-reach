"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfItem } from "./prof-item";
import { cn } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileListProps {
  parentProfileId?: Id<"profiles">;
  level?: number;
  data?: Doc<"profiles">[];
}

export const ProfileList = ({
  parentProfileId,
  level = 0
}: ProfileListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const profiles = useQuery(api.profiles.getSidebar, {
      parentProfile: parentProfileId
  });

  const onExpand = (profileId: string) => {
      setExpanded(prevExpanded => ({
          ...prevExpanded,
          [profileId]: !prevExpanded[profileId]
      }));
  };

  const onRedirect = (profileId: string) => {
      router.push(`/profiles/${profileId}`);
  };

  if (profiles === undefined) {
      return (
          <>
              <ProfItem.Skeleton level={level} />
              {level === 0 && (
                  <>
                      <ProfItem.Skeleton level={level} />
                      <ProfItem.Skeleton level={level} />
                  </>
              )}
          </>
      );
  }

  // Get height of first profile to set container height
  const singleItemHeight = 27; // min-height from ProfItem component
  const maxVisibleItems = 5;
  const containerHeight = singleItemHeight * maxVisibleItems;

  return (
      <>
          <div className="flex flex-col">
              {profiles.length > 5 && (
                  <div className="px-3 py-1 text-xs text-muted-foreground">
                      Scroll for all {profiles.length} items
                  </div>
              )}
              <div 
                  className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                  style={{ maxHeight: `${containerHeight}px` }}
              >
                  {profiles.map((profile) => (
                      <div key={profile._id}>
                          <ProfItem
                              id={profile._id}
                              onClick={() => onRedirect(profile._id)}
                              label={profile.displayName}
                              icon={UserIcon}
                              active={params.profileId === profile._id}
                              level={level}
                              onExpand={() => onExpand(profile._id)}
                              expanded={expanded[profile._id]}
                          />
                          {expanded[profile._id] && (
                              <ProfileList
                                  parentProfileId={profile._id}
                                  level={level + 1}
                              />
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </>
  );
};