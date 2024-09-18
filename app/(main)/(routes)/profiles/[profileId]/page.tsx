"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactMediaRecorder } from "react-media-recorder";

// Import the MediaRecorder dynamically to prevent SSR isues
const MediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
)

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

  // State to manage recording status
  const [isRecording, setIsRecording] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // useEffect to set isClient to True after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col items-center pb-40 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center">
        {profile?.displayName}
      </h1>
      <p className="text-xl mt-2 mb-10 text-center">{profile?.bio}</p>

        {/* Video Recorder and Player */}
       
        {isClient && (
        <div className="w-full max-w-2xl mb-8 rounded-lg flex flex-col items-center">
          <ReactMediaRecorder
            video
            render={({
              status,
              startRecording,
              stopRecording,
              mediaBlobUrl,
              previewStream,
              error,
            }) => (
              <div className="flex flex-col items-center">
                {/* Error Handling */}
                {error && <p className="text-red-500">{error}</p>}

                {/* Start Recording Button */}
                {status === "idle" && (
                  <button
                    onClick={startRecording}
                    className="flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full animate-pulse"
                  >
                    {/* Red Circle Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  </button>
                )}

                {/* Recorder and Player */}
                {(status === "recording" || status === "stopped") && (
                  <>
                    {/* Stop Recording Button */}
                    {status === "recording" && (
                      <button
                        onClick={stopRecording}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded animate-pulse"
                      >
                        Stop Recording
                      </button>
                    )}

                    {/* Video Preview */}
                    {status === "recording" && previewStream && (
                      <video
                        className="w-full h-[512px] rounded-lg mt-4 object-cover"
                        autoPlay
                        muted
                        ref={(video) => {
                          if (video && previewStream) {
                            video.srcObject = previewStream;
                          }
                        }}
                      />
                    )}

                    {/* Recorded Video Playback */}
                    {status === "stopped" && mediaBlobUrl && (
                      <video
                        className="w-full h-[512px] rounded-lg mt-4 object-cover"
                        controls
                        src={mediaBlobUrl}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          />
        </div>
      )}

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
