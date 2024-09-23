// components/VideoRecorderComponent.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useEdgeStore } from "@/lib/edgestore";
import { useEffect, useState } from "react";

// Dynamic import of MediaRecorder to prevent SSR issues
const MediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
);

interface VideoRecorderComponentProps {
  profileId: Id<"profiles">;
  videoUrl?: string;
}

const VideoRecorder = ({ profileId, videoUrl }: VideoRecorderComponentProps) => {
  const [isVideoSaved, setIsVideoSaved] = useState<boolean>(!!videoUrl);
  const [isClient, setIsClient] = useState(false);

  // Mutation to update video URL
  const updateProfileVideoUrl = useMutation(api.profiles.updateVideoUrl);

  // Initialize Edgestore
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const handleDeleteVideo = async () => {
    if (!videoUrl) return;

    try {
      // Delete the file from Edgestore
      await edgestore.publicFiles.delete({ url: videoUrl });

      // Update the profile to remove the videoUrl
      await updateProfileVideoUrl({ id: profileId, videoUrl: undefined });

      // Update local state
      setIsVideoSaved(false);

      alert("Video deleted successfully.");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("There was an error deleting your video. Please try again.");
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsVideoSaved(!!videoUrl);
  }, [videoUrl]);

  return (
    <div>
      {/* Display the saved video if it exists */}
      {videoUrl && (
        <>
          <video
            className="max-w-6xl h-[512px] rounded-lg mt-4 object-cover"
            controls
            src={videoUrl}
          />
          <div className="flex space-x-4 mt-4">
            {/* Record Again Button */}
            <button
              onClick={() => setIsVideoSaved(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Record Again
            </button>
            {/* Delete Video Button */}
            <button
              onClick={handleDeleteVideo}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Delete Video
            </button>
          </div>
        </>
      )}

      {/* Video Recorder and Player */}
      {isClient && !isVideoSaved && (
        <div className="w-full mb-8 rounded-lg flex flex-col items-center">
          <MediaRecorder
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
                    className="flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full"
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
                    {status === "stopped" && mediaBlobUrl && !isVideoSaved && (
                      <>
                        <video
                          className="w-full h-[512px] rounded-lg mt-4 object-cover"
                          controls
                          src={mediaBlobUrl}
                        />

                        {/* Upload Button */}
                        <button
                          onClick={async () => {
                            try {
                              // Fetch the Blob from mediaBlobUrl
                              const blob = await fetch(mediaBlobUrl).then((res) =>
                                res.blob()
                              );

                              // Convert Blob to File
                              const file = new File([blob], "recorded-video.webm", {
                                type: blob.type,
                              });

                              // Upload the video using handleUpload
                              const newVideoUrl = await handleUpload(file);

                              // Update the profile with the new video URL
                              await updateProfileVideoUrl({
                                id: profileId,
                                videoUrl: newVideoUrl,
                              });

                              // Set isVideoSaved to true
                              setIsVideoSaved(true);
                            } catch (error) {
                              console.error("Error saving video:", error);
                              alert("There was an error saving your video. Please try again.");
                            }
                          }}
                          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                        >
                          Save Video
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
