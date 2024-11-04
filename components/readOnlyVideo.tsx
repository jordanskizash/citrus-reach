import React, { useEffect, useRef, useState } from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

export default function ReadOnlyVideo({ videoUrl, onThumbnailGenerated }: ReadOnlyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        // Seek to a specific time for thumbnail generation (e.g., 0.1 seconds)
        videoElement.currentTime = 0.1;
      };

      const handleSeeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          try {
            const dataURL = canvas.toDataURL("image/jpeg", 0.8); // Using JPEG for smaller size
            videoElement.setAttribute("poster", dataURL);
            setThumbnailUrl(dataURL);
            // Notify parent component about the thumbnail
            if (onThumbnailGenerated) {
              onThumbnailGenerated(dataURL);
            }
          } catch (error) {
            console.error("Failed to generate thumbnail:", error);
          }
        }

        videoElement.removeEventListener("seeked", handleSeeked);
      };

      // Set the crossOrigin attribute to handle CORS
      videoElement.crossOrigin = "anonymous";

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("seeked", handleSeeked);

      return () => {
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("seeked", handleSeeked);
      };
    }
  }, [videoUrl, onThumbnailGenerated]);

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
        muted
        poster={thumbnailUrl || undefined}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}