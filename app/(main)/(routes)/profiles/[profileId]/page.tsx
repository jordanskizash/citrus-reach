"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { ProfToolbar } from "@/components/profile-toolbar";
import { useMemo, useState } from "react";
import VideoRecorder from "@/components/videoRecorder";
import { NavbarProfile } from "@/app/(main)/_components/navbarprof";

// Import Button and Input components from shadcn-ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

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

  // State to control the visibility of the reply form
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="flex flex-col items-center pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {profile ? (
        <>
          <ProfToolbar initialData={profile} />
          <p className="text-xl mt-2 mb-10 text-center">{profile.bio}</p>

          {/* Include the VideoRecorderComponent */}
          <VideoRecorder
            profileId={params.profileId}
            videoUrl={profile.videoUrl}
          />

          {/* Buttons */}
          <div className="flex flex-row items-center justify-center mt-8 space-x-4 w-full flex-wrap">
            <Button
              className="flex-1 h-16 rounded-full text-lg max-w-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </Button>
            
              <Button 
                className="flex-1 h-16 rounded-full text-lg max-w-xs">
                <a 
                  href="https://cal.com/citrusreach"
                  target="_blank"
                >
                  Book a meeting
                </a>
              </Button>

            <Button className="flex-1 h-16 rounded-full text-lg max-w-xs">
              Share
            </Button>
            <Button className="flex-1 h-16 rounded-full text-lg max-w-xs">
              <a 
                href="https://www.linkedin.com/in/jordan-steinberg/"
                target="_blank"
              >
                Get in Touch
              </a>
            </Button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
             <div className="mt-8 w-full max-w-lg">
             <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
             <form>
               <div className="mb-4">
                 {/* Name Field */}
                 <label className="block text-sm font-medium mb-2" htmlFor="name">
                   Your Name
                 </label>
                 <Input
                   id="name"
                   className="mb-3"
                   placeholder="Full Name"
                   required
                 />
         
                 {/* Email Address Field */}
                 <label className="block text-sm font-medium mb-2" htmlFor="email">
                   Email Address
                 </label>
                 <Input
                   id="email"
                   type="email"
                   className="mb-3"
                   placeholder="Email Address"
                   required
                 />
         
                 {/* Message Field */}
                 <label className="block text-sm font-medium mb-2" htmlFor="message">
                   Your Message
                 </label>
                 <Textarea
                   id="message"
                   placeholder="Type your message here..."
                   rows={6}
                   required
                 />
               </div>
               <Button type="submit">Send</Button>
             </form>
           </div>
          )}
        </>
      ) : (
        <div>Loading...</div> // You can replace this with a loader component
      )}
    </div>
  );
};

export default ProfileIdPage;
