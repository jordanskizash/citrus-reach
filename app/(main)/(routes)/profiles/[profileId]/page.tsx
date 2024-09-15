"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import necessary components

interface ProfileIdPageProps {
    params: {
        profileId: Id<"profiles">;
    };
};

const ProfileIdPage = ({
    params
}: ProfileIdPageProps) => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);

    const profile = useQuery(api.profiles.getById, {
        profileId: params.profileId,
    });

    const update = useMutation(api.profiles.update);

    const onChange = (content: string) => {
        update({
            id: params.profileId,
            content
        });
    };


    return (
        <div className="pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">{profile?.displayName}</h1>
            <p className="text-xl mt-2 mb-10">{profile?.bio}</p>
            <Tabs>
                <TabsList>
                    <TabsTrigger value="contact">Get in Touch</TabsTrigger>
                    <TabsTrigger value="learn">Learn more</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule Time</TabsTrigger>
                </TabsList>

                    <TabsContent value="contact">
                        <Editor
                            onChange={onChange}
                            initialContent={profile?.content || ""}
                        />
                    </TabsContent>
                    <TabsContent value="learn">
                        <Editor
                            onChange={onChange}
                            initialContent={profile?.content || ""}
                        />
                    </TabsContent>
                    <TabsContent value="schedule">
                        <Editor
                            onChange={onChange}
                            initialContent={profile?.content || ""}
                        />
                    </TabsContent>
            </Tabs>
        </div>
    );
}

export default ProfileIdPage;
