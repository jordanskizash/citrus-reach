import React, { useEffect, useRef, useState } from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

export default function ReadOnlyVideo({ videoUrl, onThumbnailGenerated }: ReadOnlyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        // Only generate thumbnail if video hasn't started playing
        if (!isPlaying) {
          videoElement.currentTime = 0.1;
        }
      };

      const handleSeeked = () => {
        // Only generate thumbnail if video hasn't started playing
        if (isPlaying) return;
        
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          try {
            const dataURL = canvas.toDataURL("image/jpeg", 0.8);
            setThumbnailUrl(dataURL);
            if (onThumbnailGenerated) {
              onThumbnailGenerated(dataURL);
            }
          } catch (error) {
            console.error("Failed to generate thumbnail:", error);
          }
        }
      };

      const handlePlay = () => {
        setIsPlaying(true);
        setThumbnailUrl(null); // Clear thumbnail when video starts playing
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      videoElement.crossOrigin = "anonymous";

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("seeked", handleSeeked);
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("ended", handleEnded);

      return () => {
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("seeked", handleSeeked);
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("ended", handleEnded);
      };
    }
  }, [videoUrl, onThumbnailGenerated, isPlaying]);

  if (!videoUrl) {
    return (
      <div className="w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p>No video available.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full h-[512px] rounded-lg object-cover"
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        crossOrigin="anonymous"
        poster={!isPlaying ? thumbnailUrl || undefined : undefined}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}