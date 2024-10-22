import React, { useEffect, useRef } from "react";

interface ReadOnlyVideoProps {
  videoUrl?: string;
}

export default function ReadOnlyVideo({ videoUrl }: ReadOnlyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to load metadata when component mounts or video URL changes
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

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
        poster={videoUrl + '#t=0.1'} // Generate poster from first frame
        controlsList="nodownload" // Prevent download button on supported browsers
      >
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback message for unsupported browsers */}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}