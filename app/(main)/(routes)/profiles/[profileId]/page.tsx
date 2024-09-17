"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">;
  };
}

const ProfileIdPage = ({ params }: ProfileIdPageProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  });

  const update = useMutation(api.profiles.update);

  const onChange = (content: string) => {
    update({
      id: params.profileId,
    });
  };

  return (
    <div className="flex flex-col items-center pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center">
        {profile?.displayName}
      </h1>
      <p className="text-xl mt-2 mb-10 text-center">{profile?.bio}</p>

      {/* Image Placeholder */}
      <div className="w-full max-w-3xl h-96 bg-gray-300 mb-8 rounded-lg"></div>

      <Tabs>
        <TabsList className="flex justify-center">
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
};

export default ProfileIdPage;
