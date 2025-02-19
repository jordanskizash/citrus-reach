"use client"

import React, { useEffect, useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MediaRecorderDataAvailableEvent extends Event {
  data: Blob;
}

const MediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
)

interface VideoRecorderComponentProps {
  profileId: Id<"profiles">
  videoUrl?: string
  onVideoUpload?: () => void
}

export default function VideoRecorder({ profileId, videoUrl, onVideoUpload }: VideoRecorderComponentProps) {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(videoUrl)
  const [isClient, setIsClient] = useState(false)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [shouldStartRecording, setShouldStartRecording] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [videoName, setVideoName] = useState("")
  const [tempMediaBlob, setTempMediaBlob] = useState<Blob | null>(null)

  const startRecordingRef = useRef<(() => void) | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convex mutations
  const generateUploadUrl = useMutation(api.videos.generateUploadUrl)
  const saveVideoUrl = useMutation(api.videos.saveVideoUrl)
  const deleteVideo = useMutation(api.videos.deleteVideo)

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Get a temporary upload URL from Convex
      const uploadUrl = await generateUploadUrl();
      
      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      // Get the storage ID from the upload response
      const { storageId } = await result.json();
      
      // Save the video URL to the profile with the video name
      const newVideoUrl = await saveVideoUrl({ 
        profileId, 
        storageId,
        videoName: videoName || file.name || "Untitled Video"
      });
      
      return newVideoUrl || undefined;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!currentVideoUrl) return

    try {
      await deleteVideo({ profileId })
      setCurrentVideoUrl(undefined)
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("There was an error deleting your video. Please try again.")
    }
  }

  const handleStartPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true,
      })
      setPreviewStream(stream)
    } catch (error) {
      console.error("Error accessing media devices.", error)
      alert("Could not access your camera and microphone. Please check your permissions.")
    }
  }

  const handleStopPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop())
      setPreviewStream(null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVideoName(file.name.replace(/\.[^/.]+$/, ""))
      setTempMediaBlob(file)
      setShowSaveDialog(true)
    }
  }

  const handleSaveVideo = async () => {
    if (!tempMediaBlob) return;

    try {
      const fileName = videoName.trim() || "recorded-video";
      const fileExtension = tempMediaBlob.type === 'video/webm' ? '.webm' : '.mp4';
      const file = new File([tempMediaBlob], `${fileName}${fileExtension}`, {
        type: tempMediaBlob.type
      });

      const newVideoUrl = await handleUpload(file)
      setCurrentVideoUrl(newVideoUrl)
      onVideoUpload?.()
      setShowSaveDialog(false)
      setTempMediaBlob(null)
      setVideoName("")
      handleStopPreview()
    } catch (error) {
      console.error("Error saving video:", error)
      alert("There was an error saving your video. Please try again.")
    }
  }

  useEffect(() => {
    setIsClient(true)
    return () => {
      handleStopPreview()
    }
  }, [])

  useEffect(() => {
    if (shouldStartRecording && startRecordingRef.current) {
      startRecordingRef.current()
      setShouldStartRecording(false)
    }
  }, [shouldStartRecording])

  const handleRecordAgain = async () => {
    if (currentVideoUrl) {
      await handleDeleteVideo()
    }
    await handleStartPreview()
    setShouldStartRecording(true)
  }

  const isVideoSaved = !!currentVideoUrl

  return (
    <>
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Video</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="videoName">Video Name</Label>
            <div className="mt-2">
              <Input
                id="videoName"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Upload MP4 or record on Safari for full browser compatibility
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full">
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span>Processing video...</span>
            </div>
          </div>
        )}
        
        {currentVideoUrl ? (
          <div className="relative">
            <video
              className="w-full h-[512px] rounded-lg object-cover"
              controls
              playsInline
              preload="auto"
              src={currentVideoUrl}
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button onClick={handleRecordAgain} variant="secondary">
                Record Again
              </Button>
              <Button onClick={handleDeleteVideo} variant="destructive">
                Delete Video
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center">
            {isClient && (
              <>
                {!previewStream ? (
                  <div className="flex space-x-2">
                    <Button onClick={handleStartPreview} variant="secondary">
                      <Camera className="mr-2 h-4 w-4" />
                      Activate Camera
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Video
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/mp4,video/quicktime,video/webm"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <MediaRecorder
                    video={{
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                      frameRate: { ideal: 30 }
                    }}
                    audio
                    customMediaStream={previewStream}
                    render={({
                      status,
                      startRecording,
                      stopRecording,
                      mediaBlobUrl,
                      error,
                    }) => {
                      startRecordingRef.current = startRecording

                      return (
                        <div className="w-full h-full relative">
                          {error && <p className="text-red-500 absolute top-2 left-2">{error}</p>}

                          {(status === "idle" || status === "recording") && (
                            <video
                              className="w-full h-full rounded-lg object-cover"
                              autoPlay
                              playsInline
                              muted
                              ref={(videoElement) => {
                                if (videoElement) {
                                  videoElement.srcObject = previewStream
                                }
                              }}
                            />
                          )}

                          <div className="absolute top-4 right-4 flex space-x-2">
                            {status === "idle" && !shouldStartRecording && (
                              <>
                                <Button onClick={startRecording} variant="secondary">
                                  Start Recording
                                </Button>
                                <Button onClick={handleStopPreview} variant="outline">
                                  Stop Preview
                                </Button>
                              </>
                            )}

                            {status === "recording" && (
                              <Button
                                onClick={stopRecording}
                                variant="destructive"
                                className="stop-button"
                              >
                                Stop Recording
                              </Button>
                            )}
                          </div>

                          {status === "stopped" && mediaBlobUrl && !isVideoSaved && (
                            <>
                              <video
                                className="w-full h-full rounded-lg object-cover"
                                controls
                                playsInline
                                preload="auto"
                                src={mediaBlobUrl}
                              />
                              <div className="absolute top-4 right-4">
                                <Button
                                  onClick={async () => {
                                    try {
                                      const blob = await fetch(mediaBlobUrl).then((res) =>
                                        res.blob()
                                      )
                                      setTempMediaBlob(blob)
                                      setVideoName("recorded-video")
                                      setShowSaveDialog(true)
                                    } catch (error) {
                                      console.error("Error preparing video:", error)
                                      alert("There was an error preparing your video. Please try again.")
                                    }
                                  }}
                                  variant="secondary"
                                >
                                  Save Video
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}