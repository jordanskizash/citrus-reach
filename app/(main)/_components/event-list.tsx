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
  level = 0
}: EventListProps) => {
  const params = useParams();
  const router = useRouter();

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

  // Get height of first event to set container height
  const singleItemHeight = 27; // min-height from EventItem component
  const maxVisibleItems = 5;
  const containerHeight = singleItemHeight * maxVisibleItems;

  return (
      <>
          <div className="flex flex-col">
              {events.length > 5 && (
                  <div className="px-3 py-1 text-xs text-muted-foreground">
                      Showing all {events.length} items
                  </div>
              )}
              <div 
                  className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                  style={{ maxHeight: `${containerHeight}px` }}
              >
                  {events.map((event) => (
                      <EventItem
                          key={event._id}
                          id={event._id}
                          onClick={() => onRedirect(event._id)}
                          label={event.title}
                          icon={CalendarDays}
                          active={params.eventId === event._id}
                          level={level}
                      />
                  ))}
              </div>
          </div>
      </>
  );
};