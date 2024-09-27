// components/VideoRecorderComponent.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useEdgeStore } from "@/lib/edgestore";

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
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(videoUrl);
  const [isClient, setIsClient] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [shouldStartRecording, setShouldStartRecording] = useState<boolean>(false);

  // Declare the ref with explicit type
  const startRecordingRef = useRef<(() => void) | null>(null);

  // Mutation to update video URL
  const updateProfileVideoUrl = useMutation(api.profiles.updateVideoUrl);

  // Initialize Edgestore
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const handleDeleteVideo = async () => {
    if (!currentVideoUrl) return;

    try {
      // Delete the file from Edgestore
      await edgestore.publicFiles.delete({ url: currentVideoUrl });

      // Update the profile to remove the videoUrl
      await updateProfileVideoUrl({ id: profileId, videoUrl: undefined });

      // Update local state
      setCurrentVideoUrl(undefined);
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("There was an error deleting your video. Please try again.");
    }
  };

  // Function to start the camera preview
  const handleStartPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPreviewStream(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert("Could not access your camera and microphone. Please check your permissions.");
    }
  };

  // Function to stop the camera preview
  const handleStopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
      setPreviewStream(null);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // Cleanup on component unmount
    return () => {
      handleStopPreview();
    };
  }, []);

  // useEffect to start recording when ready
  useEffect(() => {
    if (shouldStartRecording && startRecordingRef.current) {
      startRecordingRef.current();
      setShouldStartRecording(false);
    }
  }, [shouldStartRecording]);

  // Function to handle "Record Again"
  const handleRecordAgain = async () => {
    // Delete existing video
    if (currentVideoUrl) {
      await handleDeleteVideo();
    }

    // Start preview
    await handleStartPreview();

    // Set flag to start recording
    setShouldStartRecording(true);
  };

  const isVideoSaved = !!currentVideoUrl;

  return (
    <div>
      {/* Display the saved video if it exists */}
      {currentVideoUrl && (
        <>
          <video
            className="max-w-6xl h-[512px] rounded-lg mt-4 object-cover"
            controls
            src={currentVideoUrl}
          />
          <div className="flex space-x-4 mt-4">
            {/* Record Again Button */}
            <button
              onClick={handleRecordAgain}
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
          {/* Activate Camera Button */}
          {!previewStream && (
            <button
              onClick={handleStartPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Activate Camera
            </button>
          )}

          {/* Media Recorder */}
          {previewStream && (
            <MediaRecorder
              video
              audio
              customMediaStream={previewStream}
              render={({
                status,
                startRecording,
                stopRecording,
                mediaBlobUrl,
                error,
              }) => {
                // Assign startRecording to the ref
                startRecordingRef.current = startRecording;

                return (
                  <div className="flex flex-col items-center">
                    {/* Error Handling */}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Video Preview (During Preview and Recording) */}
                    {(status === "idle" || status === "recording") && (
                      <video
                        className="w-full h-[512px] rounded-lg mt-4 object-cover"
                        autoPlay
                        muted
                        ref={(videoElement) => {
                          if (videoElement) {
                            videoElement.srcObject = previewStream;
                          }
                        }}
                      />
                    )}

                    {/* Start Recording Button */}
                    {status === "idle" && !shouldStartRecording && (
                      <>
                        <button
                          onClick={startRecording}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                        >
                          Start Recording
                        </button>
                        {/* Stop Preview Button */}
                        <button
                          onClick={handleStopPreview}
                          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                          Stop Preview
                        </button>
                      </>
                    )}

                    {/* Stop Recording Button */}
                    {status === "recording" && (
                      <button
                        onClick={stopRecording}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded animate-pulse"
                      >
                        Stop Recording
                      </button>
                    )}

                    {/* Recorded Video Playback */}
                    {status === "stopped" && mediaBlobUrl && !isVideoSaved && (
                      <>
                        <video
                          className="w-full h-[512px] rounded-lg mt-4 object-cover"
                          controls
                          src={mediaBlobUrl}
                        />

                        {/* Save Video Button */}
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

                              // Update local state
                              setCurrentVideoUrl(newVideoUrl);

                              // Stop the preview
                              handleStopPreview();
                            } catch (error) {
                              console.error("Error saving video:", error);
                              alert(
                                "There was an error saving your video. Please try again."
                              );
                            }
                          }}
                          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                        >
                          Save Video
                        </button>
                      </>
                    )}
                  </div>
                );
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
