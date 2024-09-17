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
  level = 0,
}: ProfileListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const createProfile = useMutation(api.profiles.create);

  const onExpand = (profileId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [profileId]: !prevExpanded[profileId],
    }));
  };

  const profiles = useQuery(api.profiles.getSidebar, {
    parentProfile: parentProfileId,
  });

  const onRedirect = (profileId: string) => {
    router.push(`/profiles/${profileId}`);
  };

  const onCreateProfile = async () => {
    const promise = createProfile({ displayName: "Untitled", bio: "Ello Mate" });
    toast
      .promise(promise, {
        loading: "Creating a new profile...",
        success: "New profile created!",
        error: "Failed to create new profile.",
      })
      .then((profileId) => {
        router.push(`/profiles/${profileId}`);
      });
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

  return (
    <>
      <p
        style={{
          paddingLeft: level ? `${level * 12 + 25}px` : undefined,
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No profiles inside
      </p>
      {profiles.map((profile) => (
        <div key={profile._id} style={{ paddingLeft: `${level * 15}px` }}>
          <ProfItem
            id={profile._id}
            onClick={() => onRedirect(profile._id)}
            label={profile.displayName}
            icon={UserIcon}
            active={params.profileId === profile._id}
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
    </>
  );
};
