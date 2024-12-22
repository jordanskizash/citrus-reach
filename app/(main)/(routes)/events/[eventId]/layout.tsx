"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import NavbarEvents from "@/app/(main)/_components/navbarevent";


interface EventsLayoutProps {
  children: ReactNode;
}

export default function EventsLayout({
  children,
}: EventsLayoutProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  if (!isAuthenticated && !isLoading) {
    return redirect("/");
  }

  const resetWidth = () => {
    setIsCollapsed(false);
  };

  return (
    <div className={cn(
      "h-full relative",
      isCollapsed && "mr-0"
    )}>
      <NavbarEvents 
        isCollapsed={isCollapsed}
        onResetWidth={resetWidth}
      />
      <main className="h-full pt-16">
        {children}
      </main>
    </div>
  );
}