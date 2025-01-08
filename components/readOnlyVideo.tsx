import React, { useEffect, useRef, useState } from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
}

export default function ReadOnlyVideo({ videoUrl, onThumbnailGenerated }: ReadOnlyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportedVideoType, setSupportedVideoType] = useState<string | null>(null);

  // Check browser's supported video formats
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Common video formats and codecs to test
      const videoFormats = [
        'video/mp4; codecs="avc1.42E01E,mp4a.40.2"',  // H.264 + AAC
        'video/mp4; codecs="avc1.4D401E,mp4a.40.2"',  // High profile H.264 + AAC
        'video/webm; codecs="vp8,vorbis"',            // WebM
        'video/webm; codecs="vp9"'                    // WebM with VP9
      ];

      // Find the first supported format
      const supported = videoFormats.find(format => {
        return video.canPlayType(format) !== "";
      });

      if (supported) {
        setSupportedVideoType(supported);
      }
    }
  }, []);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const videoElement = videoRef.current;
      setIsLoading(true);
      setError(null);

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
            onThumbnailGenerated?.(dataURL);
          }
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
        }
      };

      const handleCanPlay = () => {
        setIsLoading(false);
        setError(null);
        if (!thumbnailUrl) {
          generateThumbnail();
        }
      };

      const handleLoadedMetadata = () => {
        // Set initial time for thumbnail generation
        videoElement.currentTime = 0.1;
      };

      const handleError = (e: Event) => {
        const videoError = (e.target as HTMLVideoElement).error;
        console.error("Video loading error:", videoError);
        setIsLoading(false);

        // Detailed error messages based on error type
        switch (videoError?.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            setError("Video playback was aborted");
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            setError("A network error occurred");
            break;
          case MediaError.MEDIA_ERR_DECODE:
            setError(`This browser doesn't support the video format. Supported format: ${supportedVideoType}`);
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setError(`This video format isn't supported. Your browser supports: ${supportedVideoType}`);
            break;
          default:
            setError("An error occurred while loading the video");
        }
      };

      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("error", handleError);

      // Force video reload when URL changes
      videoElement.load();

      return () => {
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("error", handleError);
      };
    }
  }, [videoUrl, onThumbnailGenerated, thumbnailUrl, supportedVideoType]);

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
      {error && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center p-4">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-[512px] rounded-lg object-cover"
        controls
        playsInline
        preload="auto"
        controlsList="nodownload"
        poster={thumbnailUrl || undefined}
      >
        <source 
          src={videoUrl} 
          type={supportedVideoType || "video/mp4"}
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}