"use client";

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { redirect, useParams } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";
import FormattingSidebar from "@/components/formatting-sidebar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const MainLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const params = useParams();
    
    const profileId = typeof params.profileId === 'string' 
        ? params.profileId as Id<"profiles">
        : undefined;
    
    const profile = useQuery(
        api.profiles.getById, 
        profileId ? { profileId } : "skip"
    );

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return redirect("/");
    }

    return (
        <div className="h-screen flex dark:bg-[#1F1F1F]">
            {/* Left Sidebar - Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
                <SearchCommand />
                {children}
            </main>

            {/* Right Sidebar - Formatting */}
            {profileId && profile && (
                <aside className="w-68 h-screen border-l border-border bg-background flex-shrink-0 overflow-x-hidden">
                    <div className="h-full overflow-y-auto">
                        <FormattingSidebar
                            profile={profile}
                            profileId={profileId}
                            onColorChange={(type, color) => {
                                // Handle color changes if needed at the layout level
                            }}
                        />
                    </div>
                </aside>
            )}
        </div>
    );
}
 
export default MainLayout;