import React, { useEffect, useRef, useState } from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

export default function ReadOnlyVideo({ videoUrl, onThumbnailGenerated }: ReadOnlyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoElement = videoRef.current;

      const generateThumbnail = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg", 0.8);
            setThumbnailUrl(dataURL);
            if (onThumbnailGenerated) {
              onThumbnailGenerated(dataURL);
            }
          }
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
        }
      };

      const handleCanPlay = () => {
        setIsLoading(false);
        if (!isPlaying && !thumbnailUrl) {
          generateThumbnail();
        }
      };

      const handleLoadedMetadata = () => {
        if (!isPlaying) {
          // Set a small timeout to ensure the video has loaded enough frames
          setTimeout(() => {
            videoElement.currentTime = 0.1;
          }, 100);
        }
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handleError = (e: Event) => {
        console.error("Video loading error:", (e.target as HTMLVideoElement).error);
        setIsLoading(false);
      };

      // Add event listeners
      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("ended", handleEnded);
      videoElement.addEventListener("error", handleError);

      return () => {
        // Remove event listeners
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("ended", handleEnded);
        videoElement.removeEventListener("error", handleError);
      };
    }
  }, [videoUrl, onThumbnailGenerated, isPlaying, thumbnailUrl]);

  if (!videoUrl) {
    return (
      <div className="w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p>No video available.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <p>Loading video...</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-[512px] rounded-lg object-cover"
        controls
        playsInline
        preload="auto"
        controlsList="nodownload"
        poster={!isPlaying ? thumbnailUrl || undefined : undefined}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}