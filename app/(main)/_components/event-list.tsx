"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { EventItem } from "./event-item";

interface EventListProps {
  parentEventId?: Id<"events">;
  level?: number;
  data?: Doc<"events">[];
}

export const EventList = ({
  parentEventId,
  level = 0,
}: EventListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const events = useQuery(api.events.getSidebar);

  const onRedirect = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (events === undefined) {
    return (
      <>
        <EventItem.Skeleton level={level} />
        {level === 0 && (
          <>
            <EventItem.Skeleton level={level} />
            <EventItem.Skeleton level={level} />
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
        No events
      </p>
      {events.map((event) => (
        <div key={event._id}>
          <EventItem
            id={event._id}
            onClick={() => onRedirect(event._id)}
            label={event.title}
            icon={CalendarDays}
            active={params.eventId === event._id}
          />
        </div>
      ))}
    </>
  );
};