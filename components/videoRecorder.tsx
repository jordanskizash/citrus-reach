"use client"

import React, { useEffect, useState, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import dynamic from "next/dynamic"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"
import { SingleImageDropzone } from "./single-image-dropzone"

const MediaRecorder = dynamic(
  () => import("react-media-recorder").then((mod) => mod.ReactMediaRecorder),
  { ssr: false }
)

interface VideoRecorderComponentProps {
  profileId: Id<"profiles">
  videoUrl?: string
}

export default function VideoRecorder({ profileId, videoUrl }: VideoRecorderComponentProps) {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(videoUrl)
  const [isClient, setIsClient] = useState(false)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [shouldStartRecording, setShouldStartRecording] = useState<boolean>(false)
  const [mode, setMode] = useState<"camera" | "upload">("camera")
  const [uploadedFile, setUploadedFile] = useState<File | undefined>(undefined)

  const startRecordingRef = useRef<(() => void) | null>(null)

  const updateProfileVideoUrl = useMutation(api.profiles.updateVideoUrl)
  const { edgestore } = useEdgeStore()

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file })
    return response.url
  }

  const handleDeleteVideo = async () => {
    if (!currentVideoUrl) return

    try {
      await edgestore.publicFiles.delete({ url: currentVideoUrl })
      await updateProfileVideoUrl({ id: profileId, videoUrl: undefined })
      setCurrentVideoUrl(undefined)
      setUploadedFile(undefined)
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("There was an error deleting your video. Please try again.")
    }
  }

  const handleStartPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
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

  const handleFileUpload = async (file: File | undefined) => {
    setUploadedFile(file)
    if (file) {
      try {
        const newVideoUrl = await handleUpload(file)
        await updateProfileVideoUrl({
          id: profileId,
          videoUrl: newVideoUrl,
        })
        setCurrentVideoUrl(newVideoUrl)
      } catch (error) {
        console.error("Error uploading video:", error)
        alert("There was an error uploading your video. Please try again.")
      }
    }
  }

  const isVideoSaved = !!currentVideoUrl

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => setMode("camera")}
        >
          <Camera className="mr-2 h-4 w-4" /> Use Camera
        </Button>
        <Button
          variant={mode === "upload" ? "default" : "outline"}
          onClick={() => setMode("upload")}
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Video
        </Button>
      </div>

      {currentVideoUrl ? (
        <div className="relative">
          <video
            className="w-full h-[512px] rounded-lg object-cover"
            controls
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
        <div className="relative w-full h-[512px] bg-gray-200 rounded-lg flex items-center justify-center shadow-2xl">
          {isClient && mode === "camera" && (
            <>
              {!previewStream ? (
                <Button onClick={handleStartPreview} variant="secondary" className="shadow-xl border-black">
                  Activate Camera
                </Button>
              ) : (
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
                    startRecordingRef.current = startRecording

                    return (
                      <div className="w-full h-full relative">
                        {error && <p className="text-red-500 absolute top-2 left-2">{error}</p>}

                        {(status === "idle" || status === "recording") && (
                          <video
                            className="w-full h-full rounded-lg object-cover"
                            autoPlay
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
                              className="animate-pulse"
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
                              src={mediaBlobUrl}
                            />
                            <div className="absolute top-4 right-4">
                              <Button
                                onClick={async () => {
                                  try {
                                    const blob = await fetch(mediaBlobUrl).then((res) =>
                                      res.blob()
                                    )
                                    const file = new File([blob], "recorded-video.webm", {
                                      type: blob.type,
                                    })
                                    const newVideoUrl = await handleUpload(file)
                                    await updateProfileVideoUrl({
                                      id: profileId,
                                      videoUrl: newVideoUrl,
                                    })
                                    setCurrentVideoUrl(newVideoUrl)
                                    handleStopPreview()
                                  } catch (error) {
                                    console.error("Error saving video:", error)
                                    alert("There was an error saving your video. Please try again.")
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
          {isClient && mode === "upload" && (
            <SingleImageDropzone
              width={350}
              height={350}
              value={uploadedFile}
              onChange={handleFileUpload}
              dropzoneOptions={{
                accept: { 'video/*': [] },
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}